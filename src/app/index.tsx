import { Redirect } from 'expo-router';

/** The app opens at "/", which no tab owns, so send it to My plan. */
export default function Index() {
  return <Redirect href="/plan" />;
}
