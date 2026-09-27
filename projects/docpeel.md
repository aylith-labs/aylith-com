---
name: Docpeel
tagline: 'Extract fields, check the source'
description: >-
  A document extraction prototype for supported PDFs, Word files, and images.
  Review typed fields and confidence flags against the retained original, then
  export the result.
category: data-tools
features:
  - 'Processes PDFs, Word documents, and images, with OCR for scans'
  - Extracts typed fields with confidence and review flags
  - Supports custom fields and batches of up to 20 documents
  - 'Downloads the original file and exports fields to JSON, CSV, or Excel'
targetUser: 'Freelancers, small law firms, accountants, and compliance officers'
featured: false
icon: >-
  M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5
  7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5
  2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125
  1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z
gradientFrom: '#14b8a6'
gradientTo: '#2dd4bf'
repoUrl: 'https://github.com/aylith-labs/docpeel'
order: 8
---

## Vision

Docpeel helps freelancers and small firms turn client documents into structured fields they can inspect and export. The original file remains available to the owner for checking the extraction.

## The Problem

Lawyers, accountants, and compliance officers spend time reading documents and copying values into other tools. Docpeel brings the source document and extracted fields into one review flow.

## Current scope

- Upload PDF, DOCX, JPEG, PNG, or TIFF files and extract fields by document type or a supplied field list.
- Review confidence and validation flags, download the original, and export extracted fields.
- Processing currently runs in the app background. A durable queue, field-level source references, and extraction version history are future work.

## Evaluation boundary

This catalog page is a source description, not a public processing account or
signup. A source-run evaluation requires repository access, a configured
Supabase Auth/database/private Storage project with the app's migrations, and a
model provider key. Use a long-lived app process when checking processing; the
source's background task is not a durable queue on a serverless host. The
illustrative invoice on the separate static landing is synthetic design, not a
captured extraction or an accuracy result. No public Docpeel origin, provider
run, or completion-time benchmark has been verified for this entry.
