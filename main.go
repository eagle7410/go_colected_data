package main

import (
	"github.com/gin-gonic/gin"
//	"unicode/utf8"
	"io/ioutil"
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
		pass string
		Data []Record
	}
)

var (
	data Data
	p    appParams
	OK   bool
)

func pass (val *string) string {
	s := ""
	buf := strings.Split(*val, "#")
//	buffer := []byte

	for i, _ := range buf {

		n, _ := strconv.Atoi(buf[i])
		if n > 0 {
			n /= 2;
			c := fmt.Sprintf("%q", n)
			s += c
		}

	}

	return s
}

func (ins *Data) init (data *[]string) {

	for inx, val := range *data {

		if inx == 0 {

			ins.pass = pass(&val)

		} else {

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

func main() {

	fmt.Println("data", data)

	if !OK {
		return
	}

	r := gin.Default()

	r.GET("/", func(c *gin.Context) {
		c.JSON(401, gin.H{
			"Data": "GG",
		})

	})

	r.Run(":" + p.port) // listen and server on 0.0.0.0:8080
}
