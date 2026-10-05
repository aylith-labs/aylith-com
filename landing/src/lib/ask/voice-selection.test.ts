import {describe,expect, it} from 'vitest';
import {conversationalRequest,selectServerVoice} from './voice-selection';

const voice={id:'jacqueline',locale:'en',label:'Jacqueline'};
describe('verified language-specific voice routing',()=>{
 it('uses the verified voice for explicit English automatic and explicit selections',()=>{
  expect(conversationalRequest(voice,'en','')).toEqual({language:'en',voiceId:'jacqueline'});
  expect(conversationalRequest(voice,'en','jacqueline')).toEqual({language:'en',voiceId:'jacqueline'});
 });
 it('preserves Detect, other languages, chosen owned voices and absent configuration',()=>{
  for(const [language,selected] of [['auto',''],['hu',''],['en','kristin'],['hu','jacqueline']])expect(conversationalRequest(voice,language,selected)).toBeNull();
  expect(conversationalRequest(null,'en','')).toBeNull();
 });
 it('makes the configured language visible only when that specific voice is explicitly chosen',()=>{
  expect(selectServerVoice(voice,'auto','jacqueline')).toEqual({language:'en',voice:'jacqueline'});
  expect(selectServerVoice(voice,'hu','jacqueline')).toEqual({language:'en',voice:'jacqueline'});
  expect(selectServerVoice(voice,'auto','kristin')).toEqual({language:'auto',voice:'kristin'});
  expect(selectServerVoice(voice,'hu','')).toEqual({language:'hu',voice:''});
 });
});
