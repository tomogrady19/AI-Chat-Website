# Spotify AI Insights

**Live Demo:** https://spotify-insights.com/

A full-stack Spotify analytics and AI recommendation platform.  
Authenticate with Spotify to explore your listening data, and use the AI assistant to analyse your music taste and generate music recommendations.

Built as a software engineering project, focused on:
- secure OAuth authentication
- stateless backend architecture
- modular system design
- deterministic async control flows

---

## Overview

Integrates the **Spotify Web API** and **OpenAI API** to analyse user listening data and generate personalised recommendations.

The system follows **stateless architecture principles** using secure **cookie-based authentication**, on-demand Spotify data fetching, and a fully modular backend.

A built-in **demo mode** enables public access without authentication, complying with Spotify’s developer constraints.

---

## Tech Stack

**Frontend**
- HTML5, CSS3
- Vanilla JavaScript (ES Modules)
- Spotify Web Playback SDK  

**Backend**
- Node.js, Express  
- Spotify OAuth 2.0, Spotify Web API  
- OpenAI API  

**Architecture**
- RESTful API design  
- Stateless authentication via signed cookies  
- Modular controller -> service -> utility structure
- Backend deployed on AWS Elastic Beanstalk  
- Frontend deployed via Vercel

---

## Core Features

- Secure Spotify OAuth login
- AI chat and music recommendations
- Personal listening insights (top artists, tracks, recently played)
- Multiple time-ranges available (short/medium/long term)
- Spotify playback control
- Public demo mode (no login required)
- Automatic token/session refresh handling

---

## Architecture Highlights

### Stateless System Design
- Signed HTTP cookies for authentication  
- No persistent storage of Spotify data  
- All Spotify data fetched live
- Static datasets for demo mode 

### Secure OAuth Implementation
- State validation and scope control  
- Server-side token handling
- Automatic session refresh/regeneration  

### Modular Backend Architecture 
- **Controllers**: HTTP interface, request/response handling 
- **Services**: business logic, API calls, token handling, error propagation
- **Utilities**: shared helpers, API wrappers, error normalisation

### Deterministic Async Control
All async flows are **deterministic and race-safe**, including:
- Web Playback SDK initialization
- Token refresh
- Playback/device transfer logic

This prevents race conditions, token misuse, and state/playback issues.

---

## Security Considerations

- OAuth tokens never exposed to frontend 
- HTTP-only signed cookies prevent tampering 
- No long-term storage of user data