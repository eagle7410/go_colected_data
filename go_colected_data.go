package main

import (
	"github.com/gin-gonic/contrib/renders/multitemplate"
//	"github.com/gin-gonic/gin/binding"
	"github.com/gin-gonic/gin"
	"path/filepath"
	"html/template"
	"io/ioutil"
	"strconv"
	"strings"
	"bytes"
	"fmt"
	"os"
)

type LoginForm struct {
	Password string `form:"password" binding:"required"`
}

type (
	appParams struct {
		port string
		auth, tryAuth bool
	}

	Record struct {
		Name, Login, Pass, Answer, Othen string
	}
	Data struct {
		pass     string
		passCode []int
		Data     map[string]Record
		Count    int
	}
)

var (
	data Data
	p    appParams
	OK   bool
)

func toPass (val *string) (string, []int) {
	s := ""
	c := []int{}
	buf := strings.Split(*val, "#")

	for i, _ := range buf {

		n, _ := strconv.Atoi(buf[i])
		if n > 0 {
			n /= 2
			c = append(c, n)
			char := fmt.Sprintf("%q", n)
			s += strings.Replace(char, "'", "", -1)
		}

	}

	return s, c
}

func (ins *Data) toWord (val *string) string {
	s := ""
	passCount := 0
	buf := strings.Split(*val, "#")

	for i, _ := range buf {

		if	passCount == len(ins.passCode) {
			passCount = 0
		}

		n, _ := strconv.Atoi(buf[i])

		if n > 0 {
			n -= ins.passCode[passCount]
			char := fmt.Sprintf("%q", n)
			s += strings.Replace(char, "'", "", -1)

		}

		passCount++
	}

	return strings.Replace(s, "\\r\\n", "\r\n", -1)
}

func (ins *Data) init (data *[]string) {
	var count byte
	rec := Record{}
	ins.Data = make(map[string]Record)
	for inx, val := range *data {

		if inx == 0 {

			ins.pass, ins.passCode = toPass(&val)

		} else {
			count++
			word := val

			if	count == 1 {
				rec.Name  = ins.toWord(&word)
			} else if count == 2 {
				rec.Login = ins.toWord(&word)
			} else if count == 3 {
				rec.Pass  = ins.toWord(&word)
			} else if count == 4 {
				rec.Answer  = ins.toWord(&word)
			} else if count == 5 {
				rec.Othen  = ins.toWord(&word)
				count = 0
				ins.Data[strconv.Itoa(ins.Count)] = rec
				ins.Count++
			}

		}

	}

}

func main() {

//	fmt.Println("data", data)

	if !OK {
		return
	}

	r := gin.Default()

	// Static
	r.Static("/public", "./public")

	// render
	r.HTMLRender = loadTemplates("./tpl")

	// Handel routs


	r.GET("/", func (c *gin.Context) {
		c.HTML(200, "login.html", gin.H{ "name" : "Qwerty"})
	})

	r.POST("/", func (c *gin.Context) {

		var form LoginForm

		if c.Bind(&form) == nil {
			if form.Password == data.pass {
				p.auth = true
				c.Redirect(302, "/index")

				r.GET("/index", func (c *gin.Context) {
					c.HTML(200, "index.html", gin.H{})
				})

				r.GET("/record_add", func (c *gin.Context) {
					c.HTML(200, "record_add.html", gin.H{})
				})

				r.GET("/404", func (c *gin.Context) {

				})

				r.POST("/index", func (c *gin.Context) {
					c.JSON(200, data.Data)
				})

			} else {
				c.HTML(200, "login.html", gin.H{"Message" : "Invalid value"})
			}
		} else {
			c.HTML(200, "login.html", gin.H{"Message" : "Invalid value"})
		}

	})

	r.Use(Logger());

	r.NoRoute(func(c *gin.Context) {
		c.HTML(404, "404.html", gin.H{})
	})

	r.Run(":" + p.port) // listen and server on 0.0.0.0:8080
}

func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		if !p.auth {
			c.Redirect(302, "/")
		}
	}
}

func Default () {

	p = appParams{}
	p.port = os.Getenv("port")

	if p.port == "" {
		p.port = "8080"
	}

}

func DataInit() {
	bytesRead, err := ioutil.ReadFile("Data.sdf")

	OK = true

	if err != nil {
		fmt.Println("ERR read File", err)
		OK = false
	}

	dataArr := strings.Split( bytes.NewBuffer(bytesRead).String(), "\r\n" )

	data = Data{}
	data.init(&dataArr)

}

func init() {
	Default()
	DataInit()
}

func loadTemplates(templatesDir string) multitemplate.Render {
	r := multitemplate.New()

	layouts, err := filepath.Glob(templatesDir + "/layouts/*.html")
	if err != nil {
		panic(err.Error())
	}

	includes, err := filepath.Glob(templatesDir + "/includes/*.html")
	if err != nil {
		panic(err.Error())
	}

	for _, layout := range layouts {

		filesSet := []string{layout}
		filesSet = append(filesSet, includes...)

		r.Add(filepath.Base(layout), template.Must(template.ParseFiles(filesSet...)))
	}
	return r
}
