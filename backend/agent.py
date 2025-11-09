from dotenv import load_dotenv
from prompts import AGENT_INSTRUCTION, SESSION_INSTRUCTION
from livekit import agents
from livekit.agents import AgentSession, Agent, RoomInputOptions
from livekit.plugins import (
    openai,
    noise_cancellation,
)
import os
from tools import open_url, ask_docs
from livekit.plugins import tavus
load_dotenv()


class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(instructions=AGENT_INSTRUCTION,
                         tools=[open_url, ask_docs],)


async def entrypoint(ctx: agents.JobContext):
    session = AgentSession(
        llm=openai.realtime.RealtimeModel(
            voice=os.getenv("OPENAI_VOICE", "alloy"),
        )
    )

    # Create assistant directly without MCP server/tools
    agent = Assistant()

    await session.start(
        room=ctx.room,
        agent=agent,
        room_input_options=RoomInputOptions(
            # LiveKit Cloud enhanced noise cancellation
            # - If self-hosting, omit this parameter
            # - For telephony applications, use `BVCTelephony` for best results
            noise_cancellation=noise_cancellation.BVC(),
        ),
    )

    await ctx.connect()

    # Start the avatar after the agent/session is ready to ensure the
    # first spoken message is the English introduction from the assistant.
    avatar = tavus.AvatarSession(
      replica_id=os.environ.get("REPLICA_ID"),  
      persona_id=os.environ.get("PERSONA_ID"),  
      api_key=os.environ.get("TAVUS_API_KEY"),
    )
    await avatar.start(session, room=ctx.room)

    await session.generate_reply(
        instructions=SESSION_INSTRUCTION,
    )


if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))