export type ConversationalVoice = {id: string; locale: string; label: string};
/** Automatic voice uses the verified conversational voice only for its explicit language. */
export function conversationalRequest(profile: ConversationalVoice | null, language: string, voice: string) {
  return profile && language === profile.locale && (!voice || voice === profile.id)
    ? {language: profile.locale, voiceId: profile.id}
    : null;
}
/** Choosing a language-specific voice makes that language visible; Detect is otherwise preserved. */
export function selectServerVoice(profile: ConversationalVoice | null, language: string, voice: string) {
  return {language: profile && voice === profile.id ? profile.locale : language, voice};
}
