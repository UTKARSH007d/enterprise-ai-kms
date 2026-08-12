import chromadb

client = chromadb.PersistentClient(
    path="chroma_db"
)

collection = client.get_or_create_collection(
    name="documents",
    embedding_function=None
)


def search_similar_chunks(
    query_embedding,
    top_k=5,
    department_id=None
):

    print("========================================")
    print("CHROMA DIAGNOSTIC")
    print("Collection count:", collection.count())
    print("Department ID:", department_id)
    print("========================================")

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

        print("Chroma filter:", query_params["where"])
    else:
        print("No department filter - searching all documents")

    results = collection.query(**query_params)

    print("Retrieved IDs:", results.get("ids"))
    print("Retrieved metadata:", results.get("metadatas"))
    print("========================================")

    return results




def delete_document_embeddings(document_id):

    collection.delete(
        where={
            "document_id": str(document_id)
        }
    )