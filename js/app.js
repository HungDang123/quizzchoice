var app = angular.module("myApp", ["ngRoute"])

app.config(function ($routeProvider) {
    $routeProvider
        .when("/home", { templateUrl: 'home.html' })
        .when("/contact", { templateUrl: "contact.html" })
        .when("/introduce", { templateUrl: "about.html" })
        .when("/courses", { templateUrl: "courses.html", controller: "ctrl-courses" })
        .when("/multiple-choice/:idSUB/:nameSUB", { templateUrl: "multiple-choice.html", controller: "multiCtrl" })
        .when("/login", { templateUrl: "login/login.html" })
        .when("/logout", { templateUrl: "login/login.html" })
        .when("/qa", { templateUrl: "q&a.html" })
        .when("/sign-up", { templateUrl: "login/sign-up.html", controller: "ctrl-signUp" })
        .when("/forgot-password", { templateUrl: "login/forgotPassword.html", controller: "ctrl-forgot" })
        .when("/change-password", { templateUrl: "login/changePassword.html", controller: "ctrl-change" })
        .when("/update", { templateUrl: "login/update.html", controller: "ctrl-update" })
        .otherwise({ redirectTo: "/home" })
})

app.controller('multiCtrl', function ($scope, $http, $routeParams, $interval) {
    $scope.idSUB = $routeParams.idSUB;
    $scope.nameSUB = $routeParams.nameSUB;
    implement();
    getData();
    console.log($scope.idSUB + " " + $scope.nameSUB)
    $scope.checkAnswer = function (selectedAnswer) {
        $scope.selected = selectedAnswer;
        $scope.isAnswerCorrect = ($scope.rightAnswer === $scope.selected);
        var answers = document.getElementById($scope.selected);
        var allAnswer = document.getElementsByClassName("service-item");
        // if ($scope.isAnswerCorrect) {
        //     answers.style.transition = 'background-color 0.3s';
        //     answers.style.backgroundColor = '#65B741';
        // } else {
        //     answers.style.transition = 'background-color 0.3s';
        //     answers.style.backgroundColor = '#D71313';
        // }
        if ($scope.selectedButton.length === 0) {
            $scope.selectedButton.push({ id: $scope.idOfCurrentQuestion, answers: $scope.selected })
        }
        else {
            var checkAnswer = false;
            $scope.selectedButton.map((i, index) => {
                if (i.id === $scope.idOfCurrentQuestion) {
                    checkAnswer = true;
                    $scope.selectedButton[index].id = $scope.idOfCurrentQuestion;
                }
            })
            if (checkAnswer == false) {
                $scope.selectedButton.push({ id: $scope.idOfCurrentQuestion, answers: $scope.selected })
            }
        }
        if ($scope.isAnswerCorrect) {
            if ($scope.listOfRightAnswer.length === 0 || $scope.listOfRightAnswer.length < 10) {
                $scope.listOfRightAnswer.push($scope.selected);
            } else {
                var checkAnswer = false;
                $scope.listOfRightAnswer.map(i => {
                    if (i === $scope.selected) {
                        checkAnswer = true;
                    }
                })
                if (checkAnswer == false) {
                    $scope.listOfRightAnswer.push($scope.selected)
                }
            }
        } else {
            $scope.listOfRightAnswer.map((item, index) => {
                if (item === $scope.rightAnswer) {
                    $scope.listOfRightAnswer.splice(index, 1)
                }
            })
            console.log("kq dung: " + $scope.listOfRightAnswer);
        }
        var yourAnswer = $scope.handleAnswer($scope.selected, $scope.rightAnswer)
        const localData = JSON.parse(localStorage.getItem($scope.idSUB))

        if (localData) {
            var existingIndex = localData.findIndex(x => x.questionId == $scope.idOfCurrentQuestion);
            console.log(existingIndex)
            if (existingIndex !== -1) {
                localData[existingIndex] = {
                    questionId: $scope.idOfCurrentQuestion,
                    answers: $scope.selected,
                    check: yourAnswer
                };
            } else {
                localData.push({
                    questionId: $scope.idOfCurrentQuestion,
                    answers: $scope.selected,
                    check: yourAnswer
                });
            }
            $scope.saveToLocal($scope.idSUB, localData);
        } else {
            const firstAnswer = [{
                questionId: $scope.idOfCurrentQuestion,
                answers: $scope.selected,
                check: yourAnswer
            }];
            $scope.saveToLocal($scope.idSUB, firstAnswer);
        }
        setTimeout(function () {
            $scope.$apply(function () {
                if ($scope.currentIndex < 9) {
                    $scope.currentIndex += 1;
                    getQuestion();
                } else {
                    $scope.currentIndex = 0;
                    getQuestion();
                }
            })
        }, 800)
        console.log("localdata")
        console.log(localData)
    }
    $scope.handleAnswer = (answer, rightAnswer) => {
        let checkAnswer = false;
        if (answer === rightAnswer) {
            checkAnswer = true;
        }
        return checkAnswer;
    }
    $scope.saveToLocal = (key, Obj) => {
        const myJSON = JSON.stringify(Obj);
        localStorage.setItem(key, myJSON);
    }

    $scope.handIn = () => {
        var handInCheck = confirm("Bạn có muốn kết thúc bài kiểm tra!");
        if (handInCheck) {
            var totalQuestions = $scope.listTenQuestions.length;
            var totalRightQuestions = $scope.listOfRightAnswer.length;
            $scope.totalPoint = (totalRightQuestions * 10 / totalQuestions);
            $scope.handed = true;
            $interval.cancel($scope.intervalTime);
            var localdata = JSON.parse(localStorage.getItem($scope.idSUB))
            if (localdata) {
                localdata.push({
                    handed: true,
                    score: $scope.totalPoint,
                    time: $scope.renderTime,
                    answers: $scope.listTenQuestions
                })
                $scope.saveToLocal($scope.idSUB, localdata)
            }
        }
        if (localdata !== null) {
            $scope.historyQuestion = localdata.find(item => {
                return item.handed === true
            });
        } else {
            console.log("error local")
        }
        localdata.forEach(item => {
            if (item.check === true) {
                $scope.historyQuestionRight.push(item);
            } else {
                $scope.historyQuestionWrong.push(item);
            }
        })
        console.log("Lịch sử đúng")
        console.log($scope.historyQuestionRight)
        console.log("Lịch sử sai")
        console.log($scope.historyQuestionWrong)
        $scope.currentQuestionWrong = $scope.historyQuestionWrong.length - 1;
        $scope.historyAnyQuestion = localdata.filter(item => item.questionId);
        $scope.timePerSec = Math.floor($scope.time / 10);
        $scope.percent = (($scope.listTenQuestions.length - ($scope.listTenQuestions.length - $scope.listOfRightAnswer.length)) / $scope.listTenQuestions.length) * 100 + "%";
        var record = {
            fullname: sessionStorage.getItem("student"),
            point: $scope.totalPoint,
            time: $scope.time
        }
        // $http.post("http://localhost:3000/" + $scope.idSUB, record).subscribe(res=> )
        $scope.showRecord();
    }
    $scope.showRecord = () => {
        var subject = $scope.idSUB;
        $http.get("db/record.json")
            .then(function (response) {
                $scope.rank = response.data[subject]
                console.log($scope.rank);
            })
            .catch(function (error) {
                console.log("error", error);
            });
    }

    $scope.showAnswer = () => {
        var localdata = JSON.parse(localStorage.getItem($scope.idSUB));
        if (localdata) {
            $scope.show = true;
            console.log("true");
        } else {
            $scope.show = !$scope.show;
        }
    }
    $scope.again = () => {
        localStorage.removeItem($scope.idSUB);
        getData();
        $scope.handed = false;
        $scope.show = false;
        implement();
    }
    function implement() {
        $scope.student = sessionStorage.getItem('student');
        $scope.questions = [];
        $scope.selectedButton = [];
        $scope.listOfRightAnswer = [];
        $scope.listTenQuestions = [];
        $scope.currentIndex = 0;
        $scope.totalQuestions = 0;
        $scope.initSelected = null;
        $scope.first = true;
        $scope.last = false;
        $scope.historyQuestionRight = [];
        $scope.historyQuestionWrong = [];
        $scope.currentQuestionWrong = 0;
        $scope.timePerSec = 0;
        $scope.time = 0;
        $scope.percent = "0%";
        $scope.show = false;
        $scope.rank = [];
        $scope.results = [];
    }

    function getData() {
        let localData = JSON.parse(localStorage.getItem($scope.idSUB))
        if (localData) {
            let flag = false;
            localData.find(item => {
                if (item.handed === true) {
                    flag = true;
                    $scope.handed = true;
                    $scope.totalPoint = item.score
                    $scope.renderTime = item.time
                }
            })
            if (flag === false) {
                getApiData();
            }
        } else {
            getApiData();
        }
    }

    function getApiData() {
        $http.get("db/Quizs/" + $scope.idSUB + ".js").then(function (response) {
            $scope.questions = response.data
            $scope.questions.map(item => {
                if ($scope.listTenQuestions.length < 10) {
                    var random = Math.floor(Math.random() * $scope.questions.length)
                    var flag = false;
                    if ($scope.listTenQuestions.length == 0) {
                        $scope.listTenQuestions.push($scope.questions[random])
                    } else {
                        $scope.listTenQuestions.map(i => {
                            if (i.Id == random) {
                                flag = true
                            }
                        })
                        if (flag == false) {
                            $scope.listTenQuestions.push($scope.questions[random])
                        }
                    }
                }
            })
            $scope.totalQuestions = $scope.questions.length;
            $scope.currentQuestion = $scope.listTenQuestions[$scope.currentIndex]
            $scope.rightAnswer = $scope.currentQuestion.AnswerId;
            $scope.idOfCurrentQuestion = $scope.currentQuestion.Id;
            $scope.handed = false;
            $scope.newTime();
        }, function () {
            alert("error")
        })
    }
    $scope.next = function () {
        $scope.currentIndex += 1;
        if ($scope.currentIndex > $scope.listTenQuestions.length - 1) {
            $scope.currentIndex = 0;
        }
        getQuestion();
    }
    $scope.prev = function () {
        $scope.currentIndex -= 1;
        if ($scope.currentIndex < 0) {
            $scope.currentIndex = $scope.listTenQuestions.length - 1;
        }
        getQuestion();
    }

    $scope.first = function () {
        $scope.currentIndex = 0;
        getQuestion();
    }
    $scope.last = function () {
        $scope.currentIndex = $scope.listTenQuestions.length - 1;
        getQuestion();
    }
    function getQuestion() {
        $scope.currentQuestion = $scope.listTenQuestions[$scope.currentIndex]
        $scope.rightAnswer = $scope.currentQuestion.AnswerId;
        $scope.idOfCurrentQuestion = $scope.currentQuestion.Id;
        $scope.selectedButton.map(item => {
            if (item.id === $scope.idOfCurrentQuestion) {
                $scope.selectedElement = item.answer
            }
        })
    }
    $scope.newTime = () => {
        //15 minute
        $scope.intervalTime = $interval(function () {
            $scope.time++;
            $scope.timeHanded = 900 - $scope.time;
            if ($scope.timeHanded === 0) {
                alert("Over time")
            }
            $scope.timeHanded = new Date($scope.timeHanded * 1000).toISOString().substr(14, 5);
            $scope.renderTime = new Date($scope.time * 1000).toISOString().substr(11, 8);
        }, 1000)
    }
})


// app.controller("ctrl-nav", function ($rootScope, $cookies) {
//     $rootScope.isLoggedIn = $cookies.get('user') ? true : false;

// });

app.controller("ctrl-courses", function ($scope, $http, $rootScope) {
    $rootScope.subjects = [];
    $scope.start = 0;
    $scope.currentStudent = sessionStorage.getItem('student');
    $http.get("db/Subjects.js").then(function (response) {
        $rootScope.subjects = response.data;
    })
    $scope.multipleSubjects = function () {

    }
    $scope.prevSubject = () => {
        if ($scope.start < 0) {
            $scope.start = $rootScope.subjects.length - 8;
        } else {
            $scope.start -= 8;
        }
    }
    $scope.nextSubject = () => {
        if ($scope.start > $rootScope.subjects.length - 8) {
            $scope.start = 0;
        } else {
            $scope.start += 8;
        }
    }
})
app.controller("ctrl-logout", ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {
    $scope.logout = function () {
        console.log('Logging out');
        sessionStorage.removeItem('student');
        sessionStorage.removeItem('username');
        sessionStorage.removeItem('isLoggedIn');
        sessionStorage.clear();
        var account = document.getElementById("account");
        account.innerHTML = 'Tài khoản'
        $rootScope.isLoggedIn = false;
        $location.path("/index.html"); // Assuming the route for index.html is "/index.html"
    };
}]);

app.controller("ctrl-login", ['$scope', '$http', '$location', '$rootScope', function ($scope, $http, $location, $rootScope) {
    var checked = false;
    $scope.students = [];
    $scope.currentStudent = null;

    $http.get("db/Students.json").then(function (response) {
        $scope.students = response.data.user;
    });

    $scope.signIn = function () {
        var user = $scope.username;
        var password = $scope.password;
        $rootScope.name = null;

        for (var i = 0; i < $scope.students.length; i++) {
            if ($scope.students[i].username === user && $scope.students[i].password === password) {
                $scope.currentStudent = $scope.students[i];
                checked = true; sessionStorage.setItem('student', $scope.students[i].fullname);
                break;
            }
        }

        if (checked) {
            $rootScope.isLoggedIn = true;
            sessionStorage.setItem('username', $scope.currentStudent.username);
            sessionStorage.setItem("isLoggedIn", $rootScope.isLoggedIn);
            $rootScope.name = sessionStorage.getItem('student');
            $rootScope.nameOfStu = $rootScope.name
            $location.path("/index.html");
        } else {
            $rootScope.isLoggedIn = false;
            sessionStorage.setItem("isLoggedIn", $rootScope.isLoggedIn);
            Swal.fire({
                icon: "error",
                title: "Ôi lỗi rồi...",
                text: "Tên đăng nhập hoặc tài khoản không đúng!",
                backdrop: `
                  rgba(180,31,107,0.4)
                  no-repeat
                `
            });
        }
    };
}]);
app.run(function ($rootScope, $http) {
    $rootScope.$on("$routeChangeStart", function () {
        $rootScope.loading = true;
    });
    $rootScope.$on("$routeChangeSuccess", function () {
        $rootScope.loading = false;
    });
    $rootScope.$on("$routeChangeError", function () {
        $rootScope.loading = false;
        alert("Lỗi");
    });
    $rootScope.isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";
    // $rootScope.nameOfStu = sessionStorage.getItem('student') === $rootScope.name;
    if (sessionStorage.getItem('student') === $rootScope.name)
        $rootScope.nameOfStu = $rootScope.name
    else
        $rootScope.nameOfStu = sessionStorage.getItem('student')
    // console.log('name?: ' + $rootScope.nameOfStu);
    $rootScope.subjects = [];
    $http.get("db/Subjects.js").then(function (response) {
        $rootScope.subjects = response.data;
    })
});
// app.factory("checkAuth", ['$location', '$rootScope', function ($location, $rootScope) {
//     return {
//         getuserInfo: function () {
//             if ($rootScope.isLoggedIn === undefined || $rootScope.isLoggedIn === null) {
//                 $location.path('/index.html');
//             }
//         }
//     };
// }]);



// app.service('AuthService', function () {
//     this.isLoggedIn = false;

//     this.login = function () {
//         this.isLoggedIn = true;
//     };

//     this.logout = function () {
//         this.isLoggedIn = false;
//     };
// });


app.controller("ctrl-signUp", function ($scope, $http) {
    $scope.genderOptions = ["Nam", "Nữ"];
    $scope.students = [];
    $scope.selectedGender = $scope.genderOptions[0];
    $scope.submit = function () {
        var student = {
            username: $scope.username,
            password: $scope.password,
            fullname: $scope.fullname,
            email: $scope.email,
            gender: $scope.selectedGender == "Nam" ? "true" : "false",
            birthday: $scope.birthday,
            schoolfee: 0,
            marrks: 0,
            id: generateRandomString(4)
        };
        $scope.students.push(student);
        console.log($scope.students);
        $http.post('http://localhost:3000/user', student).then(function (response) {
            alert('success');
        }), function (error) {
            console.log('error');
        }
    }
});
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomString += characters.charAt(randomIndex);
    }
    return randomString;
}
app.controller("ctrl-forgot", function ($scope, $http, $location) {
    $scope.list = []
    $http.get('db/Students.json').then(function (resp) {
        $scope.list = resp.data.user
    })

    $scope.forgotPassword = () => {
        const user = $scope.list.find((s) => s.email === $scope.email);
        const password = generateRandomString(6);
        if (user) {
            const data = {
                id: user.id,
                username: user.username,
                password: password,
            };
            Email.send({
                SecureToken: "7ce9ef4c-694e-458d-ac04-ee7c79443458",
                To: $scope.email,
                From: "hungdangak1509@gmail.com",
                Subject: "F-Learning forgot password",
                Body: "Mật khẩu mới của bạn là <b>" + password + "</b>\n Vui lòng đổi lại mật khẩu mới để bảo mật!"
            });
            Swal.fire({
                title: "Mật khẩu mới đã được gửi đến email của bạn.",
                width: 600,
                padding: "3em",
                color: "#716add",
                background: "#fff url(img/trees.png)",
                backdrop: `
                  rgba(0,0,123,0.4)
                  url("img/nyan-cat.gif")
                  left top
                  no-repeat
                `
            }).then((result) => {
                if (result.isConfirmed) {
                    // Nếu người dùng ấn "OK", chuyển trang
                    window.location.href = "/login/login.html";
                }
            });;
            console.log("Sent message");
            setTimeout(function () {
                $http.patch("http://localhost:3000/user/" + data.id, data).then(function (resp) {
                    // Xử lý sau khi PATCH được thực hiện
                }).then(function () {
                    $location.path("/login/login.html");
                });
            }, 3000);

        } else {
            Swal.fire({
                icon: "error",
                title: "Ôi lỗi rồi...",
                text: "Tên đăng nhập hoặc tài khoản không đúng!",
                backdrop: `
                  rgba(180,31,107,0.4)
                  no-repeat
                `
            });
        }
    }
})
app.controller("ctrl-change", function ($scope, $http, $location) {
    $scope.list = []
    $http.get('db/Students.json').then(function (resp) {
        $scope.list = resp.data.user

        $scope.changePassword = () => {
            var user = $scope.list.find((s) => s.username === $scope.username);
            console.log('$scope.list:', $scope.list);
            console.log('$scope.username:', $scope.username);

            var password = $scope.password;
            var newPassword = $scope.newPassword;
            var confirmPassword = $scope.confirmPassword;
            var msg;
            var check = false;
            if (user) {
                if (user.password === password) {
                    if (newPassword === confirmPassword) {
                        check = true;
                    } else {
                        msg = "Mật khẩu không trùng khớp!";
                    }
                } else {
                    msg = "Mật khẩu hiện tại không chính xác!";
                }
            } else {
                msg = "Người dùng không tồn tại!";
            }

            console.log(check);
            if (check) {
                const data = {
                    id: user.id,
                    username: user.username,
                    password: newPassword
                };
                Swal.fire({
                    title: "Mật khẩu của bạn đã được thay đổi thành công.",
                    width: 600,
                    padding: "3em",
                    color: "rgb(11,148,103)",
                    background: "#fff url(img/trees.png)",
                    backdrop: `
                      rgba(0,123,78,0.4)
                      url("img/nyan-cat.gif")
                      left top
                      no-repeat
                    `
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Nếu người dùng ấn "OK", chuyển trang
                        window.location.href = "http://127.0.0.1:5502/index.html#!/home";
                    }
                });;
                setTimeout(function () {
                    $http.patch("http://localhost:3000/user/" + data.id, data).then(function (resp) {
                        // Xử lý sau khi PATCH được thực hiện
                    }).then(function () {
                        $location.path("/login/login.html");
                    });
                }, 3000);

            } else {
                Swal.fire({
                    icon: "error",
                    title: "Ôi lỗi rồi...",
                    text: msg,
                    backdrop: `
                      rgba(180,31,107,0.4)
                      no-repeat
                    `
                });
            }
        }
    })


});

app.controller("ctrl-update", function ($scope, $http, $location) {
    $scope.genderOptions = ["Nam", "Nữ"];
    $scope.students = [];
    $scope.selectedGender = $scope.genderOptions[0];
    $scope.list = [];

    $http.get('db/Students.json').then(function (resp) {
        $scope.list = resp.data.user;
    });

    $scope.update = function () {
        var user = $scope.list.find((s) => s.username === sessionStorage.getItem("username"));
        var password = $scope.password;
        var fullname = $scope.fullname;
        var email = $scope.email;
        var gender = $scope.selectedGender === "Nam" ? "true" : "false";
        var birthday = new Date($scope.birthday);
        var formattedBirthday = + birthday.getFullYear() + "-" + (birthday.getMonth() + 1) + '-' + birthday.getDate();
        var msg;
        var check = true;

        if (password.length === 0 || fullname.length === 0) {
            msg = "Không được để trống thông tin!";
            check = false;
        }

        if (!isEmail(email)) {
            msg = "Email không đúng định dạng!";
            check = false;
        }

        if (check) {
            const student = {
                id: user.id,
                username: user.username,
                password: password,
                fullname: fullname,
                email: email,
                gender: gender,
                birthday: formattedBirthday
            };

            Swal.fire({
                title: "Thông tin cá nhân của bạn đã được thay đổi thành công.",
                width: 600,
                padding: "3em",
                color: "rgb(11,148,103)",
                background: "#fff url(img/trees.png)",
                backdrop: `
                    rgba(0,123,78,0.4)
                    url("img/nyan-cat.gif")
                    left top
                    no-repeat
                `
            }).then((result) => {
                if (result.isConfirmed) {
                    // Nếu người dùng ấn "OK", chuyển trang
                    window.location.href = "http://127.0.0.1:5502/index.html#!/home";
                }
            });

            setTimeout(function () {
                $http.patch("http://localhost:3000/user/" + student.id, student).then(function (resp) {
                    // Xử lý sau khi PATCH được thực hiện
                }).then(function () {
                    $location.path("/index.html");
                });
            }, 3000);
        } else {
            Swal.fire({
                icon: "error",
                title: "Ôi lỗi rồi...",
                text: msg,
                backdrop: `
                    rgba(180,31,107,0.4)
                    no-repeat
                `
            });
        }
    };
});

function isEmail(str) {
    var pattern = /^\w+@\w+(\.\w+)*$/;
    return pattern.test(str);
}
