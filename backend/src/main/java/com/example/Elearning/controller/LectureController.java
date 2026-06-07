package com.example.Elearning.controller;

import com.example.Elearning.model.Lecture;
import com.example.Elearning.repository.LectureRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/lectures")
@CrossOrigin(origins = "*")
public class LectureController {

    private final LectureRepository lectureRepository;

    public LectureController(LectureRepository lectureRepository) {
        this.lectureRepository = lectureRepository;
    }

    @PostMapping("/upload/{courseId}")
    public Lecture uploadLecture(
            @PathVariable Long courseId,
            @RequestParam("title") String title,
            @RequestParam("type") String type,
            @RequestParam("lectureOrder") Integer lectureOrder,
            @RequestParam("file") MultipartFile file
    ) throws IOException {

        String uploadDir = System.getProperty("user.dir") + "/uploads/";

        File folder = new File(uploadDir);
        if (!folder.exists()) {
            folder.mkdirs();
        }

        String filePath = uploadDir + file.getOriginalFilename();

        file.transferTo(new File(filePath));

        Lecture lecture = new Lecture();
        lecture.setTitle(title);
        lecture.setType(type);
        lecture.setFileName(file.getOriginalFilename());
        lecture.setFilePath(filePath);
        lecture.setCourseId(courseId);
        lecture.setLectureOrder(lectureOrder);

        return lectureRepository.save(lecture);
    }

    @GetMapping("/course/{courseId}")
    public List<Lecture> getLecturesByCourse(@PathVariable Long courseId) {
        return lectureRepository.findByCourseIdOrderByLectureOrderAsc(courseId);
    }

    @DeleteMapping("/delete/{id}")
    public String deleteLecture(@PathVariable Long id) {
        lectureRepository.deleteById(id);
        return "Lecture deleted successfully";
    }
    @PutMapping("/update-order/{id}")
    public Lecture updateLectureOrder(
            @PathVariable Long id,
            @RequestParam("lectureOrder") Integer lectureOrder
    ) {
        Lecture lecture = lectureRepository.findById(id).orElseThrow();

        lecture.setLectureOrder(lectureOrder);

        return lectureRepository.save(lecture);
    }
}
