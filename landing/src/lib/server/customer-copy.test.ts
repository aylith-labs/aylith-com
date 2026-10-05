import { describe, expect, it } from 'vitest';
import { customerProjectBody, customerProjectFields } from './customer-copy';
import { projectFromFrontmatter } from './markdown';

describe('public customer scope', () => {
 it('keeps private repository links out of customer and assistant data without hiding the public package requirements', () => {
  const data = {name:'Specwatch',repoUrl:'https://github.com/aylith-labs/specwatch',sourcePublic:false,onboarding:{access:'restricted',prerequisites:['Node.js 22.12','Install the public CLI archive'],limitations:['Normal generation can overwrite a sibling test file']}};
  const project=projectFromFrontmatter(data,'specwatch');
  expect(project.repoUrl).toBeUndefined();expect(project.onboarding?.prerequisites).toEqual(data.onboarding.prerequisites);expect(project.onboarding?.limitations).toEqual(data.onboarding.limitations);
  expect(projectFromFrontmatter({...data,sourcePublic:true},'specwatch').repoUrl).toBe(data.repoUrl);
 });
 it('does not turn an unshipped feature into an advertised capability', () => {
  const data=customerProjectFields({features:['Planned incremental diffs when designs update','Ingests your component library and design tokens'],onboarding:{access:'restricted',prerequisites:['Authorized repository access'],limitations:['No public installation or hosted-service access route has been verified','Generated code requires human review']}},'compokit');
  expect(data.features).toEqual(['Ingests your component library and design tokens']);expect(data.onboarding).toEqual({access:'restricted',prerequisites:['Authorized repository access'],limitations:['Generated code requires human review']});
 });
 it('preserves material security and data limits in the benefit presentation', () => {
  expect(customerProjectBody('','plainbase')).toContain('TLS option disables certificate verification');expect(customerProjectBody('','plainbase')).toContain('unauthenticated reruns without row-level scope or rate limits');
  expect(customerProjectBody('','knowmine')).toContain('do not verify ownership');expect(customerProjectBody('','knowmine')).toContain('verify the archive');
  expect(customerProjectBody('','bract')).toContain('compute runs separately');expect(customerProjectBody('','ourobuild')).toContain('Repeated issue creation can produce duplicates');
 });
 it('leaves other owning product content unchanged', () => {
  expect(customerProjectBody('Actual installed product facts','linkstash')).toBe('Actual installed product facts');
 });
});
