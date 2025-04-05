import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md p-6">
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-background shadow-lg",
            },
          }}
          afterSignUpUrl="/dashboard"
          signInUrl="/sign-in"
        />
      </div>
    </div>
  );
}
