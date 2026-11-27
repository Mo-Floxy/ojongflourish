import { useEffect } from "react";
import MessagesPanel from "../../components/MessagesPanel";

export default function Messages() {
  useEffect(() => {
    document.title = "Messages · Marketnest";
  }, []);

  return (
    <>
      <header className="dash-header">
        <div>
          <span className="eyebrow">Stay in touch</span>
          <h1>Messages</h1>
          <p>Chat directly with the makers behind the shops you love.</p>
        </div>
      </header>
      <MessagesPanel />
    </>
  );
}
