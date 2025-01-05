import dynamic from 'next/dynamic'

const SignupForm = dynamic(() => import('@/components/signup-form'), {
  ssr: false
})

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignupForm />
    </div>
  )
} 