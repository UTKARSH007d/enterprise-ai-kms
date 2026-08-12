import chromadb

client = chromadb.PersistentClient(
    path="chroma_db"
)

collection = client.get_or_create_collection(
    name="documents",
    embedding_function=None
)


def store_embedding(
    chunk_id: str,
    chunk_text: str,
    embedding,
    metadata: dict
):

    collection.add(
        ids=[chunk_id],
        documents=[chunk_text],
        embeddings=[embedding],
        metadatas=[metadata]
    )





def delete_document_embeddings(document_id):

    collection.delete(
        where={
            "document_id": str(document_id)
        }
    )