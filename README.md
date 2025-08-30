# Phil Barera Portfolio Site

- This Next.js application features a showcase of various software projects. The 1984 macOS was used as inspiration for the styling.
- Live reference https://philb.vercel.app/
- Hosted on Vercel, autodeploys with a push to main branch

## Requirements
Node >= v22.13.1

## Installation

```
npm i
```

## Usage

```
npm run dev
```

Go to http://localhost:3000 (or port listed if default is in use)

## Inspiration
- https://bbenchoff.github.io/system7/
- https://www.figma.com/design/5QbI9FmTNmsEKh5ElRCDph/Icons---Apple-Macintosh-Icons--1984---Community-?node-id=1203-17&t=V7emmG9UtPDF5idW-0


# MCP Server Demo Exmaples

User: “Summarize notes for Jane Doe from the last week.”
Call: query_observations({ resident_name: "Jane Doe", since_days: 7 })
Then: Speak a short summary using the returned notes.

User: “Summarize notes for Resident John for yesterday.”
Call: query_observations({ resident_name: "John", since_days: 1 })
Then: Summarize.
