# React Flow Chart and Mind Map App

![mindmap](https://user-images.githubusercontent.com/2857535/210797861-510f0a3d-fd67-46a7-8a8d-c409cb7dbcdb.png)

## To Do

[ ] Add capability to delete middle nodes and parent nodes
[ ] Add more node types
[ ] Hot key certain settings

## Description

This project is a mind mapping and flow chart tool built with React, using React Flow for visualizing data flows and hierarchical structures. It leverages Vite for efficient build tooling.

## Features

- **Interactive Mapping**: Users can create, modify, and interact with flow chart.
- **Dynamic Node Management**: Add, remove, or update nodes and edges dynamically.
- **Persistence**: Save and restore maps from local storage or JSON files.
- **Export**: Export maps to PNG images or JSON format for sharing or backup.
- **Custom Node and Edge Types**: Implements custom node and edge components for specialized behavior.

## Development

We are using [Vite](https://vitejs.dev/) for the development.

### Installation

Cloning project to your computer.

```sh
git clone https://your-repository-url.git
cd your-repository-directory
```

Now, you need to install the dependencies:

```sh
npm install
```

### Dev Server

```sh
npm run dev
```

### Build

```sh
npm run build
```

## Technologies

React: UI library for building interactive UIs.
React Flow: Library for building node-based graph applications.
Vite: Build tool that aims to provide a faster and leaner development experience.
Zustand: State management library.
Material-UI: React UI framework for implementing Google's Material Design.
React Toastify: Library for adding notifications to the application.
html-to-image: Library to capture DOM nodes and turn them into images for download.
