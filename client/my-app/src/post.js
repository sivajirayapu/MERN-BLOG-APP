import { formatISO9075 } from "date-fns";
import { Link } from "react-router-dom";

export default function Post({
  title,
  summary,
  content,
  cover,
  createdAt,
  author,
  _id,
}) {
  return (
    <div className="post">
      <div className="image">
        <Link to={`/post/${_id}`}>
          <img src={"http://localhost:4000/" + cover} alt="snap" />
        </Link>
      </div>
      <div className="texts">
        <Link to={`/post/${_id}`}>
          <h2>{title}</h2>
        </Link>
        <p className="info">
          <a clssName="author">{author.username}</a>
          <time>{formatISO9075(new Date(createdAt))}</time>
        </p>
        <p className="summery">{summary}</p>
      </div>
    </div>
  );
}
