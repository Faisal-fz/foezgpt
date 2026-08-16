const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="w-full max-w-md p-4">
                <div className="flex flex-col items-center justify-center">
                    {children}
                </div>
            </div>
        </div>
    )
}
export default AuthLayout;