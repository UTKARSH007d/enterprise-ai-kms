# Enterprise AI Knowledge Management System

An AI-powered enterprise knowledge management platform that allows organizations to securely manage internal documents and provides employees with an AI assistant capable of answering questions using information retrieved from approved company documents.

The system uses Retrieval-Augmented Generation (RAG) to retrieve relevant information from the organization's knowledge base before generating AI responses.

---

## Project Overview

The Enterprise AI Knowledge Management System is designed to provide a centralized platform for storing, searching, and accessing organizational knowledge.

Employees can:

- Search the organization's knowledge base
- Access approved enterprise documents
- Download available documents
- Ask questions through the AI Assistant
- Receive AI-generated answers based on company documents
- View the documents used as sources for AI responses
- Analyze enterprise documents using AI

Administrators can:

- Manage organization users
- Manage user roles
- Assign users to departments
- Promote employees to administrators
- Demote administrators to employees
- Delete users according to permission rules
- Upload and manage enterprise documents
- View system statistics
- Monitor system activity

The system implements role-based and department-based access control to ensure that users only access information permitted for their role and department.

---

## Key Features

### 1. Authentication & Authorization

The system provides secure authentication with role-based access control.

Supported roles:

- Super Admin
- Admin
- Employee

Access to administrative functionality is restricted according to the user's role.

---

### 2. Department-Based Access Control

Documents can be associated with specific departments.

Employees can access:

- Documents belonging to their department
- Company-wide documents

Administrators and Super Administrators have broader access according to their permissions.

---

### 3. Knowledge Base

The Knowledge Base provides employees with access to approved organizational knowledge.

Users can:

- Search documents
- Browse available documents
- View document information
- Download documents

---

### 4. AI Assistant

The AI Assistant allows users to ask questions about organizational policies, procedures, and other enterprise information.

The system:

1. Receives the user's question
2. Generates an embedding for the question
3. Searches the vector database for relevant document chunks
4. Retrieves the most relevant information
5. Sends the retrieved information to the AI model
6. Generates an answer based on the retrieved documents
7. Displays the source documents used for the response

This implements a Retrieval-Augmented Generation (RAG) workflow.

---

### 5. Source References

AI responses include references to the documents used during retrieval.

This allows users to identify the enterprise documents that contributed to the generated answer.

---

### 6. AI Document Analysis

Users can select an enterprise document and request an AI-generated analysis.

The analysis provides:

- Document summary
- Key points
- Important topics

The analysis is generated using the content of the selected enterprise document.

---

### 7. Document Management

Administrators can manage enterprise documents.

Document management includes:

- Uploading documents
- Viewing documents
- Managing documents
- Deleting documents
- Associating documents with departments

---

### 8. User Management

Administrators can manage organization users.

Features include:

- Create users
- View users
- Assign departments
- Promote employees to Admin
- Demote Admins to Employees
- Delete users

New users are automatically created with the Employee role.

Only the Super Admin can promote employees to Admin.

---

### 9. Chat Sessions

The AI Assistant maintains chat sessions and stores conversation messages.

The system stores:

- Chat sessions
- User messages
- AI responses
- Session timestamps

This allows conversations to be maintained within the application.

---

### 10. Audit Logging

Important administrative operations are recorded through audit logs.

Examples include:

- User creation
- User promotion
- User demotion
- User deletion

This provides a record of important administrative activities.

---

### 11. Admin Dashboard

The administration dashboard provides an overview of the system.

It includes statistics related to:

- Users
- Documents
- Chat sessions
- Chat messages

Administrators can also access management sections from the dashboard.

---

## System Architecture

The application follows a frontend-backend architecture.

```text
                    ┌───────────────────────┐
                    │       User            │
                    │ Employee / Admin /    │
                    │     Super Admin       │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │      Next.js          │
                    │      Frontend         │
                    │                       │
                    │ React + Tailwind CSS  │
                    └───────────┬───────────┘
                                │
                         REST API Requests
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
                    └───────┬───────┬───────┘
                            │       │
              ┌─────────────┘       └─────────────┐
              ▼                                   ▼
    ┌───────────────────┐              ┌────────────────────┐
    │    PostgreSQL     │              │   Vector Database  │
    │                   │              │                    │
    │ Users             │              │ Document Embeddings│
    │ Documents         │              │ Document Chunks    │
    │ Chat Sessions     │              │ Similarity Search  │
    │ Chat Messages     │              └─────────┬──────────┘
    │ Audit Logs        │                        │
    └───────────────────┘                        │
                                                ▼
                                     ┌────────────────────┐
                                     │      AI Model      │
                                     │                    │
                                     │ Answer Generation  │
                                     │ Document Analysis  │
                                     └────────────────────┘