using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Spiro.Modern.Backbone.Controllers {
    public class SpiroController : Controller {
        public ActionResult Index() {
            return View("Modern");
        }

        public ActionResult ModelTest() {
            return View();
        }
    }
}
