import React, { useState } from "react"

export default function ContactSection(){
  const [status,setStatus] = useState(null)

  function handleSubmit(e){
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget).entries())
    setStatus(`Thanks ${data.name || 'friend'}! We'll reply at ${data.email}.`)
    e.currentTarget.reset()
  }

  return (
    <section id="contact" className="section">
      <div className="container">
        <div className="contact-content">
          <div className="contact-header">
            <h2>Get In Touch</h2>
            <p>Have a project in mind? Let's create something amazing together.</p>
          </div>

          <div className="contact-container">
            <div className="contact-info-section">
              <h3>Let's Connect</h3>
              <p>We can help with galleries, arcade UX, or full‑stack features.</p>

              <div className="contact-details">
                <div className="contact-item">
                  <div className="contact-icon">
                    <svg viewBox="0 0 24 24"><path d="M20 4H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg>
                  </div>
                  <div className="contact-text">
                    <h4>Email</h4>
                    <p>hello@arcadevault.dev</p>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-icon">
                    <svg viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                  </div>
                  <div className="contact-text">
                    <h4>Phone</h4>
                    <p>+1 (555) 123-4567</p>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-icon">
                    <svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zM9.5 9.5A2.5 2.5 0 1 1 12 12a2.5 2.5 0 0 1-2.5-2.5z"/></svg>
                  </div>
                  <div className="contact-text">
                    <h4>Address</h4>
                    <p>123 Design Street, San Francisco, CA 94102</p>
                  </div>
                </div>
              </div>

              <div className="social-links">
                <h4>Follow Us</h4>
                <div className="social-buttons">
                  <a href="#" className="social-btn" title="Facebook"><svg viewBox="0 0 24 24"><path d="M24 12.07C24 5.44 18.63 0 12 0S0 5.44 0 12.07C0 18.08 4.39 23.04 10.12 23.95v-8.39H7.08v-3.47h3.04V9.43c0-3 1.79-4.67 4.53-4.67 1.31 0 2.69.24 2.69.24v2.95h-1.56c-1.49 0-1.96.92-1.96 1.87v2.25h3.33l-.53 3.47h-2.8v8.39C19.61 23.03 24 18.07 24 12.07z"/></svg></a>
                  <a href="#" className="social-btn" title="Twitter"><svg viewBox="0 0 24 24"><path d="M23.95 4.57a10 10 0 0 1-2.82.78A4.93 4.93 0 0 0 24 3.14a9.86 9.86 0 0 1-3.13 1.2A4.92 4.92 0 0 0 12.1 9.5 13.94 13.94 0 0 1 1.67 3.2a4.92 4.92 0 0 0 1.52 6.56 4.9 4.9 0 0 1-2.23-.6v.06a4.93 4.93 0 0 0 3.95 4.83 4.9 4.9 0 0 1-2.21.08A4.93 4.93 0 0 0 8.1 18a9.87 9.87 0 0 1-6.1 2.1c-.4 0-.79-.02-1.17-.07A13.98 13.98 0 0 0 7.57 22c9.06 0 14-7.5 14-14 0-.2 0-.42-.02-.63A10.05 10.05 0 0 0 24 4.59z"/></svg></a>
                  <a href="#" className="social-btn" title="LinkedIn"><svg viewBox="0 0 24 24"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43c-1.14 0-2.06-.93-2.06-2.07 0-1.14.92-2.06 2.06-2.06 1.14 0 2.06.92 2.06 2.06 0 1.15-.92 2.07-2.06 2.07zm1.78 13.02H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.46C23.2 24 24 23.23 24 22.27V1.73C24 .77 23.2 0 22.22 0z"/></svg></a>
                  <a href="#" className="social-btn" title="Instagram"><svg viewBox="0 0 24 24"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.22-1.67 4.77-4.92 4.92-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92C2.16 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85C2.38 3.93 3.9 2.38 7.16 2.23 8.43 2.16 8.81 2.16 12 2.16zm0 2.0c-3.24 0-3.62.01-4.9.07-2.2.1-3.21 1.12-3.3 3.3-.06 1.28-.07 1.67-.07 4.9s.01 3.62.07 4.9c.1 2.18 1.1 3.2 3.3 3.3 1.28.06 1.66.07 4.9.07s3.62-.01 4.9-.07c2.18-.1 3.2-1.12 3.3-3.3.06-1.28.07-1.66.07-4.9s-.01-3.62-.07-4.9c-.1-2.18-1.12-3.2-3.3-3.3-1.28-.06-1.66-.07-4.9-.07zM12 7.84A4.16 4.16 0 1 1 7.84 12 4.16 4.16 0 0 1 12 7.84zm6.06-2.37a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z"/></svg></a>
                </div>
              </div>
            </div>

            <div className="contact-form-section">
              {status && (
                <div style={{background:'rgba(11,64,156,.15)',border:'1px solid #264d99',padding:12,borderRadius:8,marginBottom:12}}>
                  {status}
                </div>
              )}
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Your Name</label>
                  <input id="name" name="name" required />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input id="email" name="email" type="email" required />
                </div>
                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input id="subject" name="subject" required />
                </div>
                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea id="message" name="message" required />
                </div>
                <button type="submit" className="submit-btn">Send Message</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
