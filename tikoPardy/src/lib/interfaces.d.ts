interface Kysymys {
	kysymys: string;
	vastaus: string;
	lyhenne?: string;
}
interface CourseHighscore {
	id: number;
	name: string;
	score: number;
}

export { Kysymys, CourseHighscore };
