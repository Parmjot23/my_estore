import { useState } from 'react'

export function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('Sending...')
    try {
      const res = await fetch('/api/contact/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      })
      if (res.ok) {
        setStatus('Message sent!')
        setName(''); setEmail(''); setMessage('')
      } else {
        setStatus('Error sending message')
      }
    } catch (err) {
      setStatus('Network error')
    }
  }

  return (
    <section>
      <h1 className="text-2xl font-bold mb-4">Contact</h1>
      <form onSubmit={handleSubmit} className="grid gap-2 max-w-md">
        <input className="border p-2" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <input className="border p-2" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <textarea className="border p-2" placeholder="Message" value={message} onChange={e => setMessage(e.target.value)} />
        <button className="bg-blue-600 text-white py-2" type="submit">Send</button>
      </form>
      {status && <p className="mt-2">{status}</p>}
    </section>
  )
}
