import { confirmSignIn, signIn, type SignInInput } from 'aws-amplify/auth';

export async function handleSignIn({ username, password }: SignInInput) {
  try {
    const result = await signIn({ username, password });

    // ask for a new pass
    if (result.nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
      await confirmSignIn({
        challengeResponse: 'MyN3wP455',
      });
    }

    //
    if (result.nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
      await confirmSignIn({
        challengeResponse: 'MyN3wP455',
      });
    }

    console.log(result);
  } catch (error) {
    console.log('error signing in', error);
  }
}
