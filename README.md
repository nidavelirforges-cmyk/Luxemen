# LUXEMEN - Premium E-commerce Application

LUXEMEN is a high-end, full-stack e-commerce application built with a focus on luxury aesthetics, smooth user experience, and robust functionality. It features a modern tech stack including React, TypeScript, Tailwind CSS, and Firebase.

## Features

- **Immersive Home Page**: Editorial-style layout with parallax effects and featured collections.
- **Dynamic Shop**: Advanced filtering by category and price, search with visual suggestions, and sorting options.
- **Product Details**: High-resolution image gallery with zoom, size/color selection, and related products.
- **User Authentication**: Secure Google Login via Firebase Authentication.
- **Wishlist System**: Save favorite items to a personal wishlist (persisted in Firestore).
- **Shopping Cart**: Persistent cart with local storage, quantity updates, and easy checkout.
- **Secure Checkout**: Multi-step checkout with demo payment options (UPI, Card, Net Banking, COD).
- **Order Tracking**: Real-time order status visualization with a unique tracking ID.
- **User Profile**: View order history and account details.
- **Product Reviews**: Star ratings and comments for every product.
- **Admin Dashboard**: Full control over product inventory (Add/Delete/Seed) and order management.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion (motion)
- **Icons**: Lucide React
- **Backend**: Node.js (Express)
- **Database & Auth**: Firebase (Firestore & Authentication)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository or download the source code.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your Firebase project:
   - Create a project in the [Firebase Console](https://console.firebase.google.com/).
   - Enable Firestore and Google Authentication.
   - Copy your Firebase configuration to `src/firebase-applet-config.json`.

4. Run the development server:
   ```bash
   npm run dev
   ```

### Environment Variables

Create a `.env` file in the root directory and add any necessary keys (see `.env.example`).

## Project Structure

- `src/components`: Reusable UI components like Navbar, Footer, and ProductCard.
- `src/pages`: Main application pages (Home, Shop, Cart, etc.).
- `src/context`: Authentication, Cart, and Wishlist state management.
- `src/data`: Initial mock data for seeding the database.
- `src/types.ts`: Global TypeScript interfaces and types.
- `server.ts`: Express server for handling API routes and serving the app.

## License

This project is for demonstration purposes.
