class Pcm16CaptureProcessor extends AudioWorkletProcessor {
	constructor() {
		super();
		this.pending = new Int16Array(1600);
		this.length = 0;
		this.port.onmessage = (event) => {
			if (event.data === 'flush') {
				this.emit();
				this.port.postMessage({ flushed: true });
			}
		};
	}

	emit() {
		if (!this.length) return;
		const chunk = this.pending.slice(0, this.length);
		this.port.postMessage(chunk.buffer, [chunk.buffer]);
		this.length = 0;
	}

	process(inputs) {
		const channel = inputs[0]?.[0];
		if (!channel) return true;
		for (let index = 0; index < channel.length; index++) {
			const sample = Math.max(-1, Math.min(1, channel[index]));
			this.pending[this.length++] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
			if (this.length === this.pending.length) this.emit();
		}
		return true;
	}
}

registerProcessor('ayla-pcm16-capture', Pcm16CaptureProcessor);
