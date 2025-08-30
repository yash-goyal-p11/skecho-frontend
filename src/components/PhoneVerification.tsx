import { useState, useEffect } from 'react';
import { RecaptchaVerifier, PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useMutation } from '@tanstack/react-query';

interface PhoneVerificationProps {
  onVerificationComplete: (phoneNumber: string) => void;
  initialPhoneNumber?: string;
}

export const PhoneVerification = ({ onVerificationComplete, initialPhoneNumber = '' }: PhoneVerificationProps) => {
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
  const [verificationId, setVerificationId] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const { toast } = useToast();

  useEffect(() => {
    // Initialize reCAPTCHA verifier
    const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'normal',
      callback: () => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
      },
      'expired-callback': () => {
        // Response expired. Ask user to solve reCAPTCHA again.
        toast({
          title: 'reCAPTCHA expired',
          description: 'Please solve the reCAPTCHA again.',
          variant: 'destructive',
        });
      },
    });

    return () => {
      recaptchaVerifier.clear();
    };
  }, []);

  const sendVerificationCode = async () => {
    try {
      setIsLoading(true);
      const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'normal',
      });

      const phoneProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneProvider.verifyPhoneNumber(
        formattedPhoneNumber,
        recaptchaVerifier
      );

      setVerificationId(verificationId);
      setStep('code');
      
      toast({
        title: 'Verification code sent',
        description: 'Please check your phone for the verification code.',
      });
    } catch (error: any) {
      console.error('Error sending verification code:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send verification code',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async () => {
    try {
      setIsLoading(true);
      const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
      await signInWithCredential(auth, credential);

      // Update phone verification status in backend
      const idToken = await auth.currentUser?.getIdToken();
      await fetch('/api/auth/verify-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ phoneNumber }),
      });

      toast({
        title: 'Phone verified',
        description: 'Your phone number has been successfully verified.',
      });

      onVerificationComplete(phoneNumber);
    } catch (error: any) {
      console.error('Error verifying code:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to verify code',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {step === 'phone' ? (
        <>
          <div className="space-y-2">
            <label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="Enter your phone number with country code (e.g., +1234567890)"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">
              Include your country code (e.g., +1 for US)
            </p>
          </div>

          <div id="recaptcha-container" className="my-4"></div>

          <Button
            onClick={sendVerificationCode}
            disabled={!phoneNumber || isLoading}
            className="w-full"
          >
            {isLoading ? 'Sending...' : 'Send Verification Code'}
          </Button>
        </>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="verificationCode" className="text-sm font-medium text-gray-700">
              Verification Code
            </label>
            <Input
              id="verificationCode"
              type="text"
              placeholder="Enter verification code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="w-full"
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => setStep('phone')}
              disabled={isLoading}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={verifyCode}
              disabled={!verificationCode || isLoading}
              className="flex-1"
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}; 