// app/confirm-email/page.tsx
export default function ConfirmEmail() {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 bg-background">
        <div className="w-full max-w-md text-center space-y-6">
          <h1 className="text-3xl font-bold text-primary">Confirm Your Email</h1>
          <p className="text-muted-foreground">
            We’ve sent a confirmation link to your email address. Please check your inbox (and spam/junk folder) to verify your email and complete your signup.
          </p>
          <p className="text-sm text-muted-foreground">
            Once confirmed, you’ll be redirected to the login page to sign in.
          </p>
        </div>
      </div>
    );
  }