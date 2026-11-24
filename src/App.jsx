import { useState, useEffect } from "react";

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [response, setResponse] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [deleteId, setDeleteId] = useState(undefined);
  const [putId, setPutId] = useState(undefined);
  const [putEmail, setPutEmail] = useState("");
  const [putPassword, setPutPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function searchUsers() {
      const response = await fetch("http://localhost:3000/users", {credentials: "include"});
      const data = await response.json();
      console.log(data);
      data.length > 0 && setUsers(data) 
    }
    searchUsers();
  }, [response])

  useEffect(() => {
    async function me() {
      try {
        const response = await fetch("http://localhost:3000/me", {credentials: "include"});
        const data = await response.json();
        if (response.ok === false) {
          throw new Error(data.message);
        }
        setIsLoggedIn(true);
      } catch(err) {
        setIsLoggedIn(false);
      }
    }
    me();
  }, [])

    async function handleLogout(e) {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/logout", {
        method: 'POST',
        credentials: "include",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email: loginEmail, password: loginPassword})
      });
      const data = await response.json();
      if (response.ok === false) {
        throw new Error(data.message);
      }
      setResponse(data);
      setIsLoggedIn(false);
    } catch(err) {
      setResponse(err);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/login", {
        method: 'POST',
        credentials: "include",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email: loginEmail, password: loginPassword})
      });
      const data = await response.json();
      if (response.ok === false) {
        throw new Error(data.message);
      }
      setResponse(data);
      setIsLoggedIn(true);
    } catch(err) {
      setResponse(err);
    }
  }


  async function handlePUT(e) {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:3000/users/${putId}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email: putEmail, password: putPassword})
      });
      const data = await response.json()
      if (response.ok === false) {
        throw new Error(data.message);
      }
      setResponse(data);
    } catch(err) {
      setResponse(err);
    }
  }

  async function handleDelete(e) {
    e.preventDefault();
    console.log(deleteId);
    try {
      const response = await fetch(`http://localhost:3000/users/${deleteId}`, {
        method: 'DELETE'
      })
      const data = await response.json();
      if (response.ok === false) {
        throw new Error(data.message);
      }
      console.log(data);
      setResponse(data);
    } catch(err) {
      console.log(err);
      setResponse(err);
    }
  }
  
  async function handleButton(e) {
    e.preventDefault();
    setResponse(null);
    setLoading(true)
    try {
      const res = await fetch("http://localhost:3000/users", {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({"email": email, "password": password})
      })
      const data = await res.json();
      console.log(res);
      console.log(data);
      if (res.ok === false) {
        throw new Error(data.message);
      }
      setResponse(data);
      setEmail("");
      setPassword("");
    } catch (err) {
      console.log(err);
      setResponse(err);
    }
    finally {
      setLoading(false);
    }
    
  }
  return <main>
      <form onSubmit={handleButton}>
          <input type="text" placeholder="email@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button disabled={loading}>Create User</button>
      </form>
      <form onSubmit={handleDelete}>
        <input type="number" placeholder="1" onChange={(e) => setDeleteId(e.target.value)}/>
        <button>Delete User</button>
      </form>
      <form onSubmit={handlePUT}>
          <input type="text" placeholder="email@gmail.com" value={putEmail} onChange={(e) => setPutEmail(e.target.value)} />
          <input type="password" placeholder="password" value={putPassword} onChange={(e) => setPutPassword(e.target.value)} />
          <input type="number" placeholder="1" onChange={(e) => setPutId(e.target.value)}/>
          <button disabled={loading}>Modify User</button>
      </form>
      <form onSubmit={handleLogin}>
          <input type="text" placeholder="email@gmail.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
          <input type="password" placeholder="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
          <button>Login</button>
      </form>
      <button onClick={handleLogout}>Logout</button>
      {
        response !== undefined && response !== null && loading === false ? 
          <p>{response.message}</p>
        : loading === true ?
          <p>Loading...</p>
          : null
      }
      <section>
        {isLoggedIn ? "You are logged in" : "You are not logged in"}
      </section>
      <section>
        <h2>user in db:</h2>
        {users.length > 0  && isLoggedIn ? 
          users.map(function(user){
            return <div key={user.id}>
              <p>Email: {user.email}</p>
            </div>
          })
          : "Log in to see yourself in database"
      }
      </section>
      
    </main>
}