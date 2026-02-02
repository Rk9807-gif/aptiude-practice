
export const metadata = {
  title: "Login",
  description: "Login or create a new account",
};

export default function RootLayout({ children }) {
  return (

      <div className="fixed inset-0 grid place-items-center bg-zinc-100 font-sans dark:bg-black p-1">
        {children}
      </div>
  );
}