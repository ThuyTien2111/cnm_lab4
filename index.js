const express = require('express');
//de lay anh
const multer = require('multer');
const path = require('path');

const port = 3003 //phan biet hoa thuong
const app = express() //app phai la 1 ham
let course = require('./data')

app.use(express.urlencoded({ extended: true }));
app.use(express.static('./views'))

app.set('view engine', 'ejs')
app.set('views', './views')


// Thiết lập Multer để lưu trữ tệp tải lên trong thư mục 'uploads'
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'views/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Giới hạn kích thước file ảnh là 10MB
    fileFilter: function (req, file, cb) { // Lọc chỉ cho phép file jpg, png
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(new Error('Chỉ được tải lên file JPG hoặc PNG!'));
        }
    }
});

app.get('/', (req, resp) => {
    return resp.render('index', { course })
})

app.post('/add', upload.single('image'), (req, resp) => {
    // Kiểm tra các trường dữ liệu nhập vào
    const id = Number(req.body.id);
    if (isNaN(id) || id < 0) {
        return resp.status(400).send('ID phải là số nguyên dương!');
    }

    const name = req.body.name;
    if (!/^[A-Z][a-zA-Z\s]*$/.test(name)) {
        return resp.status(400).send('Tên môn học không hợp lệ!');
    }

    const course_type = req.body.course_type;
    if (!/^[A-Z][a-zA-Z\s]*$/.test(course_type)) {
        return resp.status(400).send('Loại môn học không hợp lệ!');
    }

    const semester = req.body.semester;
    if (!/^(HK1|HK2|HK3)-([0-9]{4})-([0-9]{4})$/.test(semester)) {
        return resp.status(400).send('Hoc ky không hợp lệ!');
    }

    const department = req.body.department;
    if (!/^K\.[A-Z]{1,4}$/.test(department)) {
        return resp.status(400).send('Khoa không hợp lệ!');
    }

    const image_url = req.file ? './uploads/' + req.file.filename : null; // Lấy đường dẫn tới hình ảnh
    if (!image_url) {
        return resp.status(400).send('Ảnh không được để trống và phải có định dạng JPG hoặc PNG!');
    }

    const params = {
        "id": id,
        "name": name,
        "course_type": course_type,
        "semester": semester,
        "department": department,
        "image_url": image_url // Thêm đường dẫn hình ảnh vào thông tin khóa học
    };

    course.push(params);
    console.log(params);
    return resp.redirect('/');
});


app.post('/delete', (req, resp) => {
    // Lấy danh sách các khóa học được chọn để xóa
    const selectedCourses = req.body.selectedCourses;
    console.log(selectedCourses);

    // Kiểm tra xem có khóa học nào được chọn không
    if (!selectedCourses) {
        return resp.status(400).send('Không có khóa học nào được chọn để xóa.');
    } else if (!Array.isArray(selectedCourses)) {
        const index = course.findIndex(item => item.id === Number(selectedCourses));
        if (index !== -1) {
            course.splice(index, 1); // Xóa khóa học khỏi mảng course
        }
    } else {
        // Lặp qua danh sách khóa học được chọn và xóa chúng khỏi mảng course
        selectedCourses.forEach(courseId => {
            // Tìm index của khóa học cần xóa trong mảng course
            const index = course.findIndex(item => item.id === Number(courseId));
            if (index !== -1) {
                course.splice(index, 1); // Xóa khóa học khỏi mảng course
            }
        });
    }



    // Chuyển hướng trở lại trang chủ sau khi xóa thành công
    return resp.redirect('/');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`) //phai la dau nhay `
})