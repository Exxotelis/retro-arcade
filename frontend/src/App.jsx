import React, { useState } from "react"
import "./style.css"
import Header from "./components/Header.jsx"
import Games from "./components/Games.jsx"
import About from "./components/About.jsx"
import Contact from "./components/Contact.jsx"
import Footer from "./components/Footer.jsx"


export default function App(){
  const [q,setQ] = useState("")
  return (
    <>
      <Header query={q} setQuery={setQ} />
      <main>
        <Games query={q} />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
