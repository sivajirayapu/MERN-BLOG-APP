import { useContext, useEffect, useState } from "react";
import { Navigate , useParams} from "react-router-dom";
import "react-quill/dist/quill.snow.css";
import Editor from "../Editor";
import { UserContext } from "../UserContext";


export default function EditPost() {
  const {id} = useParams()
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState("");
  const [reDirect, setRedirect] = useState(false);
  const {userInfo} = useContext(UserContext)

  useEffect(() => {
    fetch('http://localhost:4000/post/'+id)
    .then(response => {
        response.json().then(postInfo => {
            setTitle(postInfo.title)
            setContent(postInfo.content)
            setSummary(postInfo.summary)
        })
    })
  }, [id])

  async function editPost(e) {
    e.preventDefault();
    const data = new FormData();
    data.set("title", title);
    data.set("summary", summary);
    data.set("content", content);
    data.set('id', id)
    if (files?.[0]){
        data.set("file", files?.[0]);
    }

    const response = await fetch('http://localhost:4000/post', {
        method:'PUT',
        body: data,
        credentials:'include'
    })

    if(response.ok){
      setRedirect(true)
    }
  

  }

  if (reDirect) {
    return <Navigate to={"/post/"+id} />;
  }

  if (!userInfo){
    return <Navigate to='/' />
  }

  return (
    <form onSubmit={editPost}>
      <input
        type="title"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="summary"
        placeholder="Summary"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
      />
      <input type="file" onChange={(e) => setFiles(e.target.files)} />
      <Editor value={content} onChange={setContent}/>
      <button style={{ marginTop: "5px" }}>Update Post</button>
    </form>
  );
}
