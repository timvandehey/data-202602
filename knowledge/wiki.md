# Project Specification: The Vandehey Vault (JurisJS & CouchDB Edition)

This document provides a comprehensive architectural blueprint and code reference for the **Vandehey Vault**, an "Always-On" personal wiki and data capture system. This architecture moves away from plain Markdown files in favor of a **Block-Based JSON** structure optimized for mobile PWA usage, multi-user sync, and JurisJS-driven interactivity.

---

## 1. System Architecture

The project is designed as a local-first, distributed system.

- **Source of Truth:** A **CouchDB** instance running in a Proxmox LXC.
    
- **Local Mirror:** A **PouchDB** instance residing in the browser's persistent storage (IndexedDB) on your devices.
    
- **Sync Engine:** Bidirectional, live replication between PouchDB and CouchDB.
    
- **Runtime:** **Bun** serving as the web server and automation bridge (n8n).
    
- **Frontend:** **JurisJS** for reactive, object-based rendering and a block-based editor.
    

---

## 2. The Data Model: "Block-Based Documents"

Instead of monolithic text files, a "Note" is a JSON document containing an array of independent blocks.

### Example Document Schema

JSON

```
{
  "_id": "barcelona_trip_2026",
  "type": "block_document",
  "title": "Barcelona Trip 2026",
  "blocks": [
    { "id": "b1", "type": "text", "content": "# Travel Plans" },
    { "id": "b2", "type": "table", "config": { "filter": "trip == 'barcelona'", "cols": ["Date", "Activity"] } },
    { "id": "b3", "type": "image", "name": "flight_itinerary.png" }
  ],
  "updatedAt": "2026-02-13T11:40:00Z"
}
```

---

## 3. Backend Logic (Bun Server)

The Bun server (`src/server.js`) acts as the gateway for the PWA and the entry point for n8n automations.

JavaScript

```
import { db } from "./database.js";

Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    // 1. Static File Serving (PWA Assets)
    if (url.pathname === "/" || url.pathname.includes(".js") || url.pathname.includes(".css")) {
      const path = url.pathname === "/" ? "/index.html" : url.pathname;
      return new Response(Bun.file(`./public${path}`));
    }

    // 2. n8n Capture Hook
    if (url.pathname === "/api/capture" && req.method === "POST") {
      const data = await req.json();
      const result = await db.post({ 
        ...data, 
        created_at: new Date().toISOString() 
      });
      return Response.json({ success: true, id: result.id });
    }

    return new Response("Not Found", { status: 404 });
  }
});
```

---

## 4. Frontend Core (JurisJS & PouchDB)

### The Sync Engine (`public/src/sync.js`)

This module maintains the connection between your mobile device and your CouchDB LXC.

JavaScript

```
export function initializeSync(localDB, app) {
  localDB.sync(remoteDB, {
    live: true,
    retry: true
  }).on('change', (change) => {
    // Reactive update: notify JurisJS state when a doc changes remotely
    app.setState(`records.${change.id}`, change.doc);
  });
}
```

### The Block Router (`public/src/router.js`)

The router determines how to render a record based on its `type` field.

JavaScript

```
export const Router = {
  async route(docId, db, app) {
    const doc = await db.get(docId);
    
    // Switch rendering logic based on Record Type
    if (doc.type === 'block_document') {
      return Juris.render(BlockNoteView, { blocks: doc.blocks, db }, '#app');
    } else if (doc.type === 'data_entry') {
      return Juris.render(DataEntryForm, { schema: doc.schema, db }, '#app');
    }
  }
};
```

---

## 5. JurisJS Components

### The "Dataview" Table Block

This component mimics Obsidian's Dataview by running a live Mango query against your CouchDB.

JavaScript

```
export const DataviewTable = {
  render: async ({ config, db }) => {
    const result = await db.find({ selector: config.filter });

    return {
      tag: 'table',
      class: 'wiki-datatable',
      children: [
        {
          tag: 'thead',
          children: config.cols.map(c => ({ tag: 'th', text: c }))
        },
        {
          tag: 'tbody',
          children: result.docs.map(doc => ({
            tag: 'tr',
            children: config.cols.map(c => ({ tag: 'td', text: doc[c.toLowerCase()] }))
          }))
        }
      ]
    };
  }
};
```

### The Image Block (with Blob URLs & Paste Support)

This component handles binary attachments stored in CouchDB.

JavaScript

```
export const ImageBlock = {
  render: async ({ name, docId, db }) => {
    const blob = await db.getAttachment(docId, name);
    const url = URL.createObjectURL(blob);
    
    return {
      tag: 'figure',
      children: [
        { tag: 'img', props: { src: url } },
        { tag: 'figcaption', text: name }
      ],
      onUnmount: () => URL.revokeObjectURL(url) // Cleanup memory
    };
  }
};
```

---

## 6. Development Tools

```
# General Instructions
- **Framework:** JurisJS (Object DOM syntax only).
- **Architecture:** Block-based JSON array in CouchDB.
- **Sync:** PouchDB live replication.
- **Context:** Bun server.
- **Styling:** Mobile-first, system-font stack.
```

---

## 7. Next Steps for Implementation

1. **CORS:** Enable CORS in CouchDB to allow PouchDB to connect.
    
2. **Ingestion:** Convert existing `.md` files to the `block_document` JSON format.
    
3. **PWA:** Add `manifest.json` and a Service Worker for offline home-screen access.
    
4. **Slash Menu:** Implement the `onKeydown` listener in the `TextBlock` component to trigger the component selection menu.