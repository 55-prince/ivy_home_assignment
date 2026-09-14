import Navbar from "./Navbar";

function PageLayout({ children }) {
  return (
    <div className="app">
      <Navbar />

      <main>{children}</main>
    </div>
  );
}

export default PageLayout;