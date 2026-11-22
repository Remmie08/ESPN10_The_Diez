import express from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { get_schedule, get_student_list, landing } from './landing.ts';
import { StudentDAO } from './Student.ts';
import { CourseDAO } from './Course.ts';

const app = express();
app.use(express.json());
dotenv.config();

const port = 3000; // use this port, e.g. localhost:3000

let pool= new Pool({
    user: 'rmaury', //replace with your username
    host: 'db-pgsql-nyc3-53905-do-user-41991816-0.h.db.ondigitalocean.com',
    database: 'defaultdb',
    password: process.env.PASSWORD,
    port: 25060,
    ssl: { rejectUnauthorized: false }
});

const studentDAO = new StudentDAO(pool);
const courseDAO = new CourseDAO(pool);

const SECTION_ID = /^[12]$/;
const COURSE_ID = /^[A-Z]{2,3}-[0-9]{3}$/;
const STUDENT_ID = /^[0-9]{5}$/;
const SEMESTER = /^(Spring|Summer|Fall)$/;
const YEAR = /^[0-9]{4}$/;

type semesterQuery = { semester: string | undefined , year: string | undefined};
type semesterRequest = express.Request<{course_id: string, sec_id: string}, XMLHttpRequestBodyInit, XMLHttpRequestBodyInit, semesterQuery>;
type scheduleRequest = express.Request<{student_id: string}, XMLHttpRequestBodyInit, XMLHttpRequestBodyInit, semesterQuery>;
type studentQuery = { student_id: string | undefined } & semesterQuery;
type studentRequest = express.Request<{course_id: string}, XMLHttpRequestBodyInit, XMLHttpRequestBodyInit, studentQuery>;

app.get('/', (req: express.Request, res: express.Response) => {
    res.send(landing());
});

app.get('/schedule/:student_id', async (req: scheduleRequest, res: express.Response) => {
    const yearstr = req.query.year;
    const semester = req.query.semester;
    const student_id = req.params.student_id;

    if (!STUDENT_ID.test(student_id)) {
        res.status(400).send('Invalid student_id format');
        return;
    }

    if (!SEMESTER.test(semester || '') || !YEAR.test(yearstr || '')) {
        res.status(400).send('Invalid semester or year format');
        return;
    }

    if (!semester || !yearstr) {
        res.status(400).send('Missing semester or year query parameters');
        return;
    }

    const student = await studentDAO.get_student(student_id);
    if (!student) {
        res.status(404).send('Student not found');
        return;
    }
    const year = parseInt(yearstr, 10);
    const schedule = await studentDAO.get_registered_classes(student.id, semester, year);
    console.log("Schedule(Server): ", schedule);
    res.status(200).send(get_schedule(student, schedule, semester, year));
});

app.get('/class_list/:course_id/:sec_id', async (req: semesterRequest, res: express.Response) => {
    const yearstr = req.query.year;
    const semester = req.query.semester;
    const course_id = req.params.course_id;
    const sec_id = req.params.sec_id;

    if (!COURSE_ID.test(course_id)) {
        res.status(400).send('Invalid course_id format');
        return;
    }
    
    if (!SECTION_ID.test(sec_id)) {
        res.status(400).send('Invalid sec_id format');
        return;
    }

    if (!semester || !SEMESTER.test(semester) || !yearstr || !YEAR.test(yearstr)) {
        res.status(400).send('Invalid or missing semester or year');
        return;
    }


    const course = await courseDAO.get_course(course_id);
    if (!course) {
        res.status(404).send('Course not found');
        return;
    }

    const section = await courseDAO.get_section(sec_id);
    if (!section) {
        res.status(404).send('Section not found');
        return;
    }

    const year = parseInt(yearstr, 10);
    const students = await courseDAO.get_registered_students(course, section, semester, year);
    console.log("Students(Server): ", students);
    res.status(200).send(get_student_list(course, section, students, semester, year));
});

app.get('/allowed/:course_id', async (req: studentRequest, res: express.Response) => {
    const course_id = req.params.course_id;
    const student_id = req.query.student_id;

    if (!COURSE_ID.test(course_id)) {
        res.status(400).send('Invalid course_id format');
        return;
    }

    if (!STUDENT_ID.test(student_id || '')) {
        res.status(400).send('Invalid student_id format');
        return;
    }

    if (!student_id) {
        res.status(400).send('Missing student_id query parameter');
        return;
    }

    const course = await courseDAO.get_course(course_id);
    if (!course) {
        res.status(404).send('Course not found');
        return;
    }

    const student = await studentDAO.get_student(student_id);
    if (!student) {
        res.status(404).send('Student not found');
        return;
    }

    const course_prereqs = await courseDAO.get_prerequisites(course);
    const taken_prereqs = await studentDAO.get_taken_courses(student.id);
    console.log("Course Prerequisites(Server): ", course_prereqs);
    console.log("Taken Prerequisites(Server): ", taken_prereqs);
    const allowed = course_prereqs.every(prereq => taken_prereqs.some(taken => taken.course_id === prereq.course_id));
    if (!allowed) {
        res.status(200).json({'allowed': false});
    } else {
        res.status(200).json({'allowed': true});
    }
});

app.listen(port, () => {
    console.log("Listening on port " + port);
});