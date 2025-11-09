import os
from livekit import api
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from flask_cors import CORS
from flasgger import Swagger
from livekit.api import LiveKitAPI, ListRoomsRequest
import uuid
from datetime import datetime
from pathlib import Path

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
Swagger(app)

async def generate_room_name():
    name = "room-" + str(uuid.uuid4())[:8]
    rooms = await get_rooms()
    while name in rooms:
        name = "room-" + str(uuid.uuid4())[:8]
    return name

async def get_rooms():
    api = LiveKitAPI()
    rooms = await api.room.list_rooms(ListRoomsRequest())
    await api.aclose()
    return [room.name for room in rooms.rooms]

@app.route("/getToken")
async def get_token():
    """
    Get LiveKit access token
    ---
    tags:
      - auth
    summary: Get a JWT token for LiveKit
    parameters:
      - name: name
        in: query
        type: string
        required: false
        default: my name
      - name: room
        in: query
        type: string
        required: false
    responses:
      200:
        description: JWT token
        schema:
          type: string
    """
    name = request.args.get("name", "my name")
    room = request.args.get("room", None)
    
    if not room:
        room = await generate_room_name()
        
    token = api.AccessToken(os.getenv("LIVEKIT_API_KEY"), os.getenv("LIVEKIT_API_SECRET")) \
        .with_identity(name)\
        .with_name(name)\
        .with_grants(api.VideoGrants(
            room_join=True,
            room=room
        ))
    
    return token.to_jwt()

@app.post("/uploadDoc")
def upload_doc():
    """
    Upload a PDF for RAG ingestion
    ---
    tags:
      - docs
    summary: Upload a PDF and index it for document Q&A
    consumes:
      - multipart/form-data
    parameters:
      - in: formData
        name: file
        type: file
        required: true
        description: PDF file to upload
    responses:
      200:
        description: Document ingested
        schema:
          type: object
          properties:
            doc_id:
              type: string
            filename:
              type: string
    """
    from werkzeug.utils import secure_filename
    from tempfile import NamedTemporaryFile
    try:
        from . import rag  # local module when packaged
    except ImportError:
        import rag  # fallback when running server.py directly

    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400
    filename = secure_filename(file.filename)
    # Create a temp file, ensure it is CLOSED before moving/ingestion (Windows file lock safety)
    with NamedTemporaryFile(delete=False) as tmp:
        tmp_path = tmp.name
    # Save uploaded file to the temp path after the file handle is closed
    file.save(tmp_path)
    try:
        doc_id = rag.add_pdf(tmp_path, original_name=filename)
    finally:
        # The rag.add_pdf will move the file into storage; ensure temp file is removed if it still exists
        try:
            os.remove(tmp_path)
        except Exception:
            pass
    return jsonify({"doc_id": doc_id, "filename": filename})

@app.post("/transcriptions")
def save_transcription():
    """
    Save a transcription line to a room-specific log file
    ---
    tags:
      - transcripts
    summary: Append a transcription to the room's transcript file
    consumes:
      - application/json
    parameters:
      - in: body
        name: payload
        required: true
        schema:
          type: object
          properties:
            room:
              type: string
            type:
              type: string
              enum: [agent, user]
            text:
              type: string
            ts:
              type: number
            participant:
              type: string
    responses:
      200:
        description: Saved
        schema:
          type: object
          properties:
            ok:
              type: boolean
    """
    data = request.get_json(silent=True) or {}
    room = data.get("room") or "unknown-room"
    speaker_type = data.get("type") or "agent"
    text = data.get("text") or ""
    ts = data.get("ts")
    participant = data.get("participant") or ""

    # Prepare directory and file path
    transcripts_dir = Path(__file__).parent / "data" / "transcripts"
    transcripts_dir.mkdir(parents=True, exist_ok=True)
    file_path = transcripts_dir / f"{room}.txt"

    # Format timestamp
    if ts is not None:
        try:
            ts_dt = datetime.fromtimestamp(ts / 1000.0)
            ts_str = ts_dt.isoformat()
        except Exception:
            ts_str = str(ts)
    else:
        ts_str = datetime.utcnow().isoformat()

    line = f"[{ts_str}] ({speaker_type}) {participant}: {text}\n"
    try:
        with open(file_path, "a", encoding="utf-8") as f:
            f.write(line)
        return jsonify({"ok": True})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)