# Enterprise AI Knowledge Management System

An AI-powered enterprise knowledge management platform that enables organizations to securely manage internal documents and provides employees with an AI assistant capable of answering questions using information retrieved from approved company documents.

The system uses Retrieval-Augmented Generation (RAG) to retrieve relevant information from the organization's knowledge base before generating AI responses.

---

## Project Overview

The Enterprise AI Knowledge Management System provides a centralized platform for managing and accessing organizational knowledge.

The platform supports three user roles:

- Super Admin
- Admin
- Employee

Users can access information according to their role and department permissions.

The system combines:

- Role-Based Access Control (RBAC)
- Department-Based Access Control
- Document Management
- Vector Similarity Search
- Retrieval-Augmented Generation (RAG)
- AI Document Analysis
- Chat Sessions
- Audit Logging

---

## Key Features

### 1. Authentication & Authorization

Secure authentication with role-based access control.

Supported roles:

- Super Admin
- Admin
- Employee

Administrative functionality is restricted according to user permissions.

---

### 2. Department-Based Access Control

Documents can be associated with specific departments or marked as company-wide.

Employees can access:

- Documents belonging to their department
- Company-wide documents

Administrators and Super Administrators have broader access according to their permissions.

---

### 3. Knowledge Base

The Knowledge Base provides access to approved organizational documents.

Users can:

- Browse documents
- Search documents
- View document information
- Download documents

---

### 4. AI Assistant

The AI Assistant allows employees to ask questions about organizational policies, procedures, and other enterprise information.

The RAG pipeline works as follows:

1. User submits a question
2. The question is converted into an embedding
3. Relevant document chunks are searched using vector similarity
4. The most relevant chunks are retrieved
5. Retrieved information is provided to the AI model
6. The AI model generates a response
7. Source documents are returned with the response

This ensures that responses are grounded in the organization's uploaded knowledge base.

---

### 5. Document Processing & Embeddings

When a document is uploaded:

1. The document is stored
2. Text is extracted
3. The extracted text is divided into smaller chunks
4. Embeddings are generated for the chunks
5. The embeddings and metadata are stored in the vector database
6. The chunks become available for semantic retrieval

Document metadata includes information such as:

- Document ID
- Document title
- Department
- Document category

---

### 6. Source References

AI responses include the documents used during retrieval.

Users can therefore identify which enterprise documents contributed to an AI-generated answer.

---

### 7. AI Document Analysis

Users can select an enterprise document and request AI-generated analysis.

The analysis can provide:

- Document summary
- Key points
- Important topics

---

### 8. Document Management

Administrators can:

- Upload documents
- View documents
- Manage documents
- Delete documents
- Associate documents with departments

---

### 9. User Management

Administrators can manage organization users.

Features include:

- Create users
- View users
- Assign departments
- Promote employees to Admin
- Demote Admins to Employees
- Delete users

New users are created with the Employee role.

Administrative actions are restricted according to role permissions.

---

### 10. Chat Sessions

The AI Assistant maintains individual chat sessions.

The system stores:

- Chat sessions
- User messages
- AI responses
- Session timestamps

This allows users to continue conversations within the application.

---

### 11. Audit Logging

Important administrative operations are recorded using audit logs.

Examples include:

- User creation
- User deletion
- User promotion
- User demotion
- Document upload
- Document download
- Setting updates

Audit logs provide administrators with a record of important system activities.

---

### 12. Admin Dashboard

The Admin Dashboard provides an overview of the system.

It includes statistics related to:

- Users
- Documents
- Chat sessions
- Chat messages

Administrators can also access:

- User Management
- Document Management
- Settings
- Audit Logs

---

## Role & Permission Model

| Feature | Employee | Admin | Super Admin |
|---|---|---|---|
| AI Assistant | Yes | Yes | Yes |
| Knowledge Base | Yes | Yes | Yes |
| Department Documents | Own Department | All | All |
| Company-wide Documents | Yes | Yes | Yes |
| Document Upload | No | Yes | Yes |
| Document Delete | No | Yes | Yes |
| User Management | No | Yes* | Yes |
| Promote Employee to Admin | No | No | Yes |
| Demote Admin | No | No | Yes |
| Audit Logs | No | Yes | Yes |
| System Settings | No | Yes | Yes |

\* Subject to the application's administrative permission rules.

---

## System Architecture

The application follows a frontend-backend architecture.

```text
                    ┌───────────────────────┐
                    │         Users         │
                    │                       │
                    │ Employee / Admin /    │
                    │     Super Admin       │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │       Next.js         │
                    │       Frontend        │
                    │                       │
                    │ React + Tailwind CSS  │
                    └───────────┬───────────┘
                                │
                           REST APIs
                                │
                                ▼
                    ┌───────────────────────┐
                    │       FastAPI         │
                    │       Backend         │
                    │                       │
                    │ Authentication        │
                    │ Authorization         │
                    │ Document Management   │
                    │ Chat                  │
                    │ AI Analysis           │
                    │ Audit Logging         │
                    └───────┬───────┬───────┘
                            │       │
                 ┌──────────┘       └───────────┐
                 ▼                              ▼
       ┌───────────────────┐          ┌────────────────────┐
       │    PostgreSQL     │          │     ChromaDB       │
       │                   │          │                    │
       │ Users             │          │ Document Chunks    │
       │ Documents         │          │ Embeddings         │
       │ Chat Sessions     │          │ Metadata           │
       │ Chat Messages     │          │ Similarity Search  │
       │ Audit Logs        │          └─────────┬──────────┘
       └───────────────────┘                    │
                                                ▼
                                     ┌────────────────────┐
                                     │    Gemini AI       │
                                     │                    │
                                     │ Embeddings         │
                                     │ Answer Generation  │
                                     │ Document Analysis  │
                                     └────────────────────┘
