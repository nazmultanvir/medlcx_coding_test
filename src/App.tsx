import { useState } from 'react';
import CaptchaVerification from './pages/CaptchaVerification';

type VerificationStatus = 'idle' | 'verifying' | 'success' | 'failed';

function App() {
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('idle');
  const [showCaptcha, setShowCaptcha] = useState(false);

  const startVerification = () => {
    setVerificationStatus('verifying');
    setShowCaptcha(true);
  };

  const onVerificationComplete = (success: boolean) => {
    setVerificationStatus(success ? 'success' : 'failed');
    setShowCaptcha(false);

    // Reset after a few seconds so user can see the result
    setTimeout(() => {
      setVerificationStatus('idle');
    }, 4500);
  };

  // Get friendly status message based on current state  
  const getStatusMessage = () => {
    switch (verificationStatus) {
      case 'success':
        return 'Nice work! You\'re all verified.';
      case 'failed':
        return 'Hmm, that didn\'t quite work out. Give it another try?';
      default:
        return '';
    }
  };

  if (showCaptcha) {
    return (
      <CaptchaVerification
        onComplete={onVerificationComplete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 max-w-md w-full text-center">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
          Security Check
        </h1>

        <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
          We need to make sure you're human. This will just take a moment!
        </p>

        <button
          onClick={startVerification}
          disabled={verificationStatus === 'verifying'}
          className={`
            w-full py-3 px-4 sm:px-6 rounded-lg font-medium text-white transition-all duration-200 text-sm sm:text-base
            ${verificationStatus === 'verifying'
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-brand-navy hover:bg-brand-gold hover:text-brand-navy active:bg-brand-gold'
            }
          `}
        >
          {verificationStatus === 'verifying' ? 'Working on it...' : 'Let\'s Verify You\'re Human'}
        </button>

        {/* Status message display */}
        <div className="mt-4 sm:mt-6 min-h-[60px] flex items-center justify-center">
          {getStatusMessage() && (
            <div className={`
              text-center p-3 sm:p-4 rounded-lg border-2 transition-all duration-300
              ${verificationStatus === 'success'
                ? 'bg-green-50 border-green-300 text-green-700'
                : 'bg-red-50 border-red-300 text-red-700'
              }
            `}>
              <p className="text-base sm:text-lg font-semibold">
                {getStatusMessage()}
              </p>
              <p className="text-xs sm:text-sm mt-1 opacity-75">
                {verificationStatus === 'success'
                  ? 'All set! You\'re good to go.'
                  : 'Just click the button above when you\'re ready.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
