import { Link } from "react-router-dom";
import { useContext, useEffect } from "react";
import { UserContext } from "./UserContext";

export default function Header() {
  const {setUserInfo, userInfo} = useContext(UserContext)
  

  useEffect(() => {
    fetch("http://localhost:4000/profile", {
      credentials: "include",
    }).then((response) => {
      response.json().then((info) => {
        setUserInfo(info)
      });
    });
  }, []);


  function logout() {
    fetch('http://localhost:4000/logout', {
      method:'POST',
      credentials:'include',
    })
    setUserInfo(null)
  }

  const username = userInfo?.username

  return (
    <header>
      <Link to="/" className="logo">
        MyBlog
      </Link>
      <nav>
        {username && (
          <>
            <Link to="/create">Create New Post</Link>
            <a onClick={logout}>Logout</a>
          </>
        )}
        {!username && (
          <>
            <Link to="/Login">Login</Link>
            <Link to="/Register">Regitser</Link>
          </>
        )}
      </nav>
    </header>
  );
}
