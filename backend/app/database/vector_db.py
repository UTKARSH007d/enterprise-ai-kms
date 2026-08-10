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


def search_similar_chunks(
    query_embedding,
    top_k=5,
    department_id=None
):

    query_params = {
        "query_embeddings": [query_embedding],
        "n_results": top_k
    }

    if department_id is not None:
        query_params["where"] = {
            "department_id": {
                "$in": [
                    str(department_id),
                    "company-wide"
                ]
            }
        }

    results = collection.query(**query_params)

    return results


def delete_document_embeddings(document_id):

    collection.delete(
        where={
            "document_id": str(document_id)
        }
    )