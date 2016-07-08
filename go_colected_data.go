package main

import (
	"github.com/gin-gonic/contrib/renders/multitemplate"
//    "github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
//	"html/template"
	"io/ioutil"
	//"net/http"
	"strconv"
	"strings"
	"bytes"
	"fmt"
	"os"
)

type (
	appParams struct {
		port string
	}

	Record struct {
		Name, Login, Pass, Answer, Othen string
	}
	Data struct {
		pass     string
		passCode []int
		Data     map[int]Record
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
			s += char
		}

	}

	return s, c
}

func (ins *Data) toWord (val *string) string {
	s:= ""
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
			s += char
		}

		passCount++
	}

	return s
}

func (ins *Data) init (data *[]string) {
	var count byte
	rec := Record{}
	ins.Data = make(map[int]Record)
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
				ins.Data[ins.Count] = rec
				ins.Count++
			}

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

func Render() {

}

func main() {

//	fmt.Println("data", data)

	if !OK {
		return
	}

	r := gin.New()

	// Static
	r.Static("/public", "./public")
	r.Static("/bower_components", "./bower_components")
	// render
	r.LoadHTMLGlob("tpl/*")
//	r.HTMLRender = createMyRender()


	r.GET("/", func (c *gin.Context) {
//		r.HTMLTemplates = template.Must(template.ParseFiles("templates/layout.html", "templates/home.html"))
		c.HTML(200, "index.html", gin.H{})

	})

	r.Run(":" + p.port) // listen and server on 0.0.0.0:8080
}

func createMyRender() multitemplate.Render {
	r := multitemplate.New()
	r.AddFromFiles("index", "base.html", "base.html")
	r.AddFromFiles("article", "base.html", "article.html")
	r.AddFromFiles("login", "base.html", "login.html")
	r.AddFromFiles("dashboard", "base.html", "dashboard.html")

	return r
}
