import{readFileSync}from 'node:fs';import{runInNewContext}from 'node:vm';
import{expect,it}from 'vitest';

it('real capture worklet resamples negotiated48k mono to100ms16k PCM, clips and uses little-endian bytes',()=>{
 let Processor!:new()=>{process(inputs:Float32Array[][]):boolean};const emitted:ArrayBuffer[]=[];
 runInNewContext(readFileSync('static/managed-voice-capture-worklet.js','utf8'),{AudioWorkletProcessor:class{port={postMessage:(data:ArrayBuffer)=>emitted.push(data)};},sampleRate:48000,registerProcessor:(_name:string,value:typeof Processor)=>Processor=value,Int16Array,ArrayBuffer,DataView,Number,Math});
 const processor=new Processor();processor.process([[new Float32Array(4800).fill(2)]]);expect(emitted).toHaveLength(1);expect(emitted[0].byteLength).toBe(3200);expect(new DataView(emitted[0]).getInt16(0,true)).toBe(32767);
 processor.process([[new Float32Array(4800).fill(-2)]]);expect(new DataView(emitted[1]).getInt16(0,true)).toBe(-32768);
});
