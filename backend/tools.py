from livekit.agents import function_tool, RunContext
import webbrowser
try:
    from . import rag  # when imported as part of the backend package
except ImportError:
    import rag  # when running scripts directly from the backend directory


@function_tool
async def open_url(url: str, context: RunContext)-> str:
    """
    Opens a URL in the user's default web browser.
    """
    try:
        webbrowser.open(url)
        return f"Opened {url} in your web browser."
    except Exception as e:
        return f"Failed to open {url}. Error: {str(e)}"


@function_tool
async def ask_docs(query: str, context: RunContext) -> str:
    """
    Retrieve relevant information from uploaded PDFs and return excerpts.
    Use this tool when answering questions about team documents.
    """
    try:
        hits = rag.search(query, top_k=5)
        if not hits:
            return "No documents found. Please upload PDFs first."
        response_lines = [
            "Top matches from uploaded PDFs:",
        ]
        for i, h in enumerate(hits, start=1):
            snippet = h["text"].strip().replace("\n", " ")
            if len(snippet) > 400:
                snippet = snippet[:400] + "…"
            response_lines.append(f"{i}. [{h['name']}] {snippet}")
        response_lines.append("\nUse these excerpts to craft a precise answer.")
        return "\n".join(response_lines)
    except Exception as e:
        return f"Failed to search documents. Error: {str(e)}"