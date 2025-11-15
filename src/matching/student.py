class Student:
    def __init__(self, id: str, first_name: str | None, last_name: str | None, email: str, grad_year: int | None, major: str | None, interests: list[str] | None, sex: str | None, dorm: str | None, involvements: str | None, close_friends: list[str] | None, survey_completed: bool):
        self.id = id
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.grad_year = grad_year
        self.major = major
        self.interests = interests
        self.sex = sex
        self.dorm = dorm
        self.involvements = involvements
        self.close_friends = close_friends
        self.survey_completed = survey_completed