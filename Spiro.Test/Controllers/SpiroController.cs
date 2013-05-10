using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace RestfulObjects.Mvc.ClientApp.Controllers
{
    public class SpiroController : Controller
    {
        //
        // GET: /ClientApp/

        public ActionResult Index()
        {
            return View("Classic");
        }

        public ActionResult Narrow() {
            return View("Narrow");
        }

        public ActionResult SpiroQunit() {
            return View("SpiroQunit");
        }

        public ActionResult SpiroClassicQunit() {
            return View("SpiroClassicQunit");
        }

    }
}
