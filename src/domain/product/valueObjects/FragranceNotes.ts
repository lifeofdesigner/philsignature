export interface OlfactoryPyramid {
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
}

export class FragranceNotes {
  private readonly top: readonly string[];
  private readonly heart: readonly string[];
  private readonly base: readonly string[];

  constructor(pyramid: OlfactoryPyramid) {
    this.top = Object.freeze([...pyramid.topNotes]);
    this.heart = Object.freeze([...pyramid.heartNotes]);
    this.base = Object.freeze([...pyramid.baseNotes]);
  }

  getTopNotes(): readonly string[] {
    return this.top;
  }

  getHeartNotes(): readonly string[] {
    return this.heart;
  }

  getBaseNotes(): readonly string[] {
    return this.base;
  }

  getAllNotes(): string[] {
    return [...this.top, ...this.heart, ...this.base];
  }

  hasNote(noteQuery: string): boolean {
    const q = noteQuery.toLowerCase();
    return this.getAllNotes().some((n) => n.toLowerCase().includes(q));
  }

  toJSON(): OlfactoryPyramid {
    return {
      topNotes: [...this.top],
      heartNotes: [...this.heart],
      baseNotes: [...this.base],
    };
  }
}
