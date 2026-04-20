

export default function AuthLayout({ children }: { children: React.ReactNode }) {

  return (
    <div className="flex bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
