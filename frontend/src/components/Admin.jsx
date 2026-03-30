import React, { useState } from 'react'

function Admin({ setIsAdmin, setData, data }) {
  const [password, setPassword] = useState('')
  const [verified, setVerified] = useState(false)

  const [form, setForm] = useState({
    name: '',
    party: '',
    accused: '',
    photo: ''
  })

  const handleLogin = () => {
    if (password === 'admin123') {
      setVerified(true)
      setIsAdmin(true)
    } else {
      alert('Wrong password')
    }
  }

  const handleAdd = () => {
    if(!form.name || !form.party) { alert("Name & Party required"); return }

    const newItem = {
      id: Date.now(),
      ...form
    }

    setData(prev => [...prev, newItem])

    setForm({ name: '', party: '', accused: '', photo: '' })
  }

  const handleDelete = (id) => {
    setData(prev => prev.filter(item => item.id !== id))
  }

  return !verified ? (
    <div>
      <h2>Admin Login</h2>
      <input type="password" placeholder="Enter password" onChange={e=>setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  ) : (
    <div>
      <h2>Admin Panel</h2>
      <input placeholder="Name" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} />
      <input placeholder="Party" value={form.party} onChange={e=>setForm({...form, party: e.target.value})} />
      <input placeholder="Accused" value={form.accused} onChange={e=>setForm({...form, accused: e.target.value})} />
      <input placeholder="Photo URL" value={form.photo} onChange={e=>setForm({...form, photo: e.target.value})} />
      <button onClick={handleAdd}>Add Candidate</button>

      <hr />
      {data.map(item=>(
        <div key={item.id}>
          <p>{item.name} ({item.party})</p>
          <button onClick={()=>handleDelete(item.id)}>Delete</button>
        </div>
      ))}
    </div>
  )
}

export default Admin