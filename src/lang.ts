import { Player, RawMessage, world } from '@minecraft/server';

const LF: RawMessage = { text: '\n' };

type WithT<L extends number, A extends string[] = [string]> = A['length'] extends L ? A : WithT<L, [string, ...A]>;

type ParaWithT<
	T extends Array<Line | LineWith<any>>,
	S extends Array<string[] | RawMessage> = [],
	I extends any[] = []
> = I['length'] extends T['length']
	? S
	: T[I['length']] extends Line
	? ParaWithT<T, S, [any, ...I]>
	: T[I['length']] extends LineWith<infer C>
	? ParaWithT<T, [...S, WithT<C> | RawMessage], [any, ...I]>
	: never;

export const enum Prefixes {}

abstract class Base<R> {
	constructor(public readonly id: string, public readonly val: R) {}
}

abstract class Raw<R> extends Base<R> {
	public abstract text(): RawMessage;
	send(prefix?: Prefixes, player?: Player) {
		(player ?? world).sendMessage(prefix ? { translate: prefix as any, with: { rawtext: [this.text()] } } : this.text());
	}
}

abstract class RawWith<R, W> extends Base<R> {
	public abstract text(w: W): RawMessage;
	send(w: W, prefix?: Prefixes, player?: Player) {
		(player ?? world).sendMessage(prefix ? { translate: prefix as any, with: { rawtext: [this.text(w)] } } : this.text(w));
	}
}

class Line extends Raw<string> {
	public text(): RawMessage {
		return { translate: this.id };
	}
}

class LineWith<T extends number> extends RawWith<string, WithT<T> | RawMessage> {
	public text(w: WithT<T> | RawMessage): RawMessage {
		return { translate: this.id, with: w };
	}
}

class Para extends Raw<Line[]> {
	public text(): RawMessage {
		const out: RawMessage[] = [];
		const len = this.val.length;
		for (let i = 0; i < len; i++) {
			const v = this.val[i];
			out.push(v.text());
			if (i !== len - 1) {
				out.push(LF);
			}
		}
		return { rawtext: [{ rawtext: out }] };
	}
}

class ParaWith<T extends Array<Line | LineWith<any>>> extends RawWith<[...T], ParaWithT<[...T]>> {
	public text(w: ParaWithT<[...T]>): RawMessage {
		const out: RawMessage[] = [];
		const len = this.val.length;
		for (let i = 0, wi = 0; i < len; i++) {
			const v = this.val[i];
			out.push(v instanceof Line ? v.text() : v.text((w as any)[wi++]));
			if (i !== len - 1) {
				out.push(LF);
			}
		}
		return { rawtext: [{ rawtext: out }] };
	}
}

// --------------------------------------------------------------------------------------------- //
export default {"script":{
/**备用重生点 %s 设置成功*/
"set_point":new LineWith<1>(`script.set_point`, `备用重生点 %s 设置成功`),
/**备用重生点已全部设置完毕*/
"full_points":new Line(`script.full_points`, `备用重生点已全部设置完毕`),
/**已在备用重生点 %s 重生*/
"respawn":new LineWith<1>(`script.respawn`, `已在备用重生点 %s 重生`),
/**没有可用的备用重生点或备用重生点已全部失效*/
"no_points":new Line(`script.no_points`, `没有可用的备用重生点或备用重生点已全部失效`),
/**已清除所有备用重生点*/
"clear":new Line(`script.clear`, `已清除所有备用重生点`),
/**已设置重生点数量 %s*/
"count":new LineWith<1>(`script.count`, `已设置重生点数量 %s`),
/**[主世界] %s 号重生点: %s*/
"get_points_overload":new LineWith<2>(`script.get_points_overload`, `[主世界] %s 号重生点: %s`),
/**[下界] %s 号重生点: %s*/
"get_points_nether":new LineWith<2>(`script.get_points_nether`, `[下界] %s 号重生点: %s`),
/**[末地] %s 号重生点: %s*/
"get_points_the_end":new LineWith<2>(`script.get_points_the_end`, `[末地] %s 号重生点: %s`)}}
export const enum Prefixes {}