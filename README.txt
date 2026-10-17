# ==============================================================================
# MANAGEMENT FULL-STACK PROJECT - SYSTEM & FRAMEWORK REQUIREMENTS
# ==============================================================================
# Project Name: Management
# Workspace:    /Users/abdos/Dev/shaghaf_task
# Date:         October 2026
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. BACKEND FRAMEWORK & RUNTIME (ASP.NET Core)
# ------------------------------------------------------------------------------
# Framework:          ASP.NET Core 8.0 (LTS)
# Target Framework:   net8.0
# SDK Version:        8.0.426
# Runtime:            Microsoft.AspNetCore.App 8.0.426
# Architecture:       macOS arm64 (Apple Silicon)
# Project File:       Management/Management.csproj
# Solution File:      Management.sln
# Template:           ASP.NET Core MVC (Model-View-Controller)
# Local Ports:        http://localhost:5266 | https://localhost:7099
# Run Command:        dotnet run --project Management/Management.csproj

# ------------------------------------------------------------------------------
# 2. FRONTEND FRAMEWORK & LIBRARIES (React + Vite)
# ------------------------------------------------------------------------------
# Package Manager:    npm 12.0.2 / Node.js v24.15.0
# Bundler / Tooling:  Vite v8.3.4
# Language:           TypeScript ~6.0.2
# Root Directory:     frontend/
# Local Port:         http://localhost:3000 (Proxy configured for /api -> :5266)
# Run Command:        npm run dev (inside frontend/)
# Build Command:      npm run build

# Core Frontend Dependencies:
react==19.2.8
react-dom==19.2.8
lucide-react==1.58.0

# Frontend Dev Dependencies:
typescript==6.0.2
vite==8.3.4
@vitejs/plugin-react==6.1.1
oxlint==1.81.0
@types/react==19.2.18
@types/react-dom==19.2.7
@types/node==24.13.3

# ------------------------------------------------------------------------------
# 3. PYTHON RUNTIME & ENVIRONMENT
# ------------------------------------------------------------------------------
# Python Version:     3.14.7
# Virtual Env:        .venv / venv
# Package Installer:  pip 26.2.1
# Activation:         source .venv/bin/activate
