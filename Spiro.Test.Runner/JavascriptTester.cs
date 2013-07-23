// Copyright © Naked Objects Group Ltd ( http://www.nakedobjects.net). 
// All Rights Reserved. This code released under the terms of the 
// Microsoft Public License (MS-PL) ( http://opensource.org/licenses/ms-pl.html) 

using System;
using System.Collections.ObjectModel;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading;
using System.Xml;
using System.Xml.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using OpenQA.Selenium;
using OpenQA.Selenium.Firefox;

namespace NakedObjects.Mvc.Test.Javascript {
    [TestClass]
    public class JavaScriptTester {
        private static string FilePath(string resourcename) {
            string fileName = resourcename.Remove(0, resourcename.IndexOf(".", StringComparison.Ordinal) + 1);

            string newFile = Path.Combine(Directory.GetCurrentDirectory(), fileName);

            if (File.Exists(newFile)) {
                File.Delete(newFile);
            }

            Assembly assembly = Assembly.GetExecutingAssembly();

            using (Stream stream = assembly.GetManifestResourceStream("RestfulObjects.Spiro.Test.Runner." + resourcename)) {
                using (FileStream fileStream = File.Create(newFile, (int) stream.Length)) {
                    var bytesInStream = new byte[stream.Length];
                    stream.Read(bytesInStream, 0, bytesInStream.Length);
                    fileStream.Write(bytesInStream, 0, bytesInStream.Length);
                }
            }

            return newFile;
        }

        private static void DeployDrivers() {
            FilePath("Drivers.chromedriver.exe");
            FilePath("Drivers.IEDriverServer.exe");
        }

        [TestInitialize]
        public void TestInit() {
            DeployDrivers();
        }

        private static void Clean(ref IWebDriver iwd) {
            if (iwd != null) {
                iwd.Close();
                iwd = null;
            }
        }


        [TestCleanup]
        public void TestClean() {}

        private void RunQUnitTests(IWebDriver iwd, string url,  string browser, string tests) {
            iwd.Navigate().GoToUrl(url);

            int timeOut = 200;
            while (iwd.FindElement(By.Id("qunit-testresult")).Text.Contains("Running")) {
                Thread.Sleep(1000);
                if (timeOut-- <= 0) {
                    break;
                }
            }

            AssertQUnitTestResults(iwd, browser, tests);
        }


        [TestMethod]
        public void RunViewTestsFirefox() {
            using (var ff = new FirefoxDriver()) {
              //  RunQUnitTests(ff, "http://mvc.nakedobjects.net:1081/UnitTestSpiro/Spiro/spiroclassicqunit",  "Firefox", "View");
            }
        }

        [TestMethod]
        public void RunModelTestsFirefox() {
            using (var ff = new FirefoxDriver()) {
             //   RunQUnitTests(ff,  "http://mvc.nakedobjects.net:1081/UnitTestSpiro/Spiro/spiroqunit", "Firefox", "Model");
            }
        }

        //[TestMethod]
        //public void RunIeQUnitTests() {
        //    using (var ie = new InternetExplorerDriver()) {
        //        RunQUnitTests(ie, "ie");
        //        ie.Quit();
        //    }
        //}

        //[TestMethod]
        //public void RunCrQUnitTests() {
        //    using (var cr = new ChromeDriver()) {
        //        RunQUnitTests(cr, "chrome");
        //        cr.Quit();
        //    }
        //}


        private void AssertQUnitTestResults(IWebDriver iwd, string browser, string testname) {
            ReadOnlyCollection<IWebElement> liElements = iwd.FindElements(By.CssSelector("#qunit-tests > li"));

            if (!liElements.Any()) {
                Assert.Fail("No test results");
            }

            //foreach (var liElement in liElements) {
            //    Assert.IsTrue(liElement.GetAttribute("class") == "pass", liElement.Text);
            //}

            // write a testresults file 

            IWebElement results = iwd.FindElement(By.Id("qunit-testresult"));

            string passed = results.FindElement(By.ClassName("passed")).Text;
            string total = results.FindElement(By.ClassName("total")).Text;
            string failures = results.FindElement(By.ClassName("failed")).Text;
            int tests = liElements.Count();
            int failed = liElements.Count(x => x.GetAttribute("class") != "pass");

            string name = "NakedObjects.Javascript." + browser + "." +  testname;

            var xml = new XElement("test-results",
                                   new XAttribute("name", Assembly.GetExecutingAssembly().CodeBase),
                                   new XAttribute("total", tests),
                                   new XAttribute("errors", failures),
                                   new XAttribute("failures", failed),
                                   new XAttribute("not-run", 0),
                                   new XAttribute("inconclusive", 0),
                                   new XAttribute("ignored", 0),
                                   new XAttribute("skipped", 0),
                                   new XAttribute("invalid", 0),
                                   new XAttribute("date", DateTime.Now.Date.ToShortDateString()),
                                   new XAttribute("time", DateTime.Now.ToShortTimeString()),
                                   new XElement("environment",
                                                new XAttribute("nunit-version", "na"),
                                                new XAttribute("clr-version", "na"),
                                                new XAttribute("os-version", "na"),
                                                new XAttribute("platform", "na"),
                                                new XAttribute("cwd", "na"),
                                                new XAttribute("machine-name", "na"),
                                                new XAttribute("user", "na"),
                                                new XAttribute("user-domain", "na")),
                                   new XElement("culture-info",
                                                new XAttribute("current-culture", "na"),
                                                new XAttribute("current-uiculture", "na")),
                                   new XElement("test-suite",
                                                new XAttribute("type", "Assembly"),
                                                new XAttribute("name", Assembly.GetExecutingAssembly().CodeBase),
                                                new XAttribute("executed", "True"),
                                                new XAttribute("result", "Success"),
                                                new XAttribute("success", "True"),
                                                new XAttribute("time", 0),
                                                new XAttribute("asserts", 0),
                                                new XElement("results",
                                                             new XElement("test-suite",
                                                                          new XAttribute("type", "TestFixture"),
                                                                          new XAttribute("name", name),
                                                                          new XAttribute("executed", "True"),
                                                                          new XAttribute("result", "Success"),
                                                                          new XAttribute("success", "True"),
                                                                          new XAttribute("time", 0),
                                                                          new XAttribute("asserts", 0),
                                                                          new XElement("results",
                                                                                       from liElement in liElements
                                                                                       select new XElement("test-case",
                                                                                                           new XAttribute("name", liElement.FindElement(By.CssSelector(".test-name")).Text),
                                                                                                           new XAttribute("executed", "True"),
                                                                                                           new XAttribute("result", liElement.GetAttribute("class") == "pass" ? "Success" : "Failure"),
                                                                                                           new XAttribute("success", liElement.GetAttribute("class") == "pass"),
                                                                                                           new XAttribute("time", 0),
                                                                                                           new XAttribute("asserts", 0)))))));

            var doc = new XDocument(xml);

            WriteXmlFile(doc, Path.Combine(GetTestResultsDirectory(), "javascript-test-" + browser + testname + ".xml"));
        }

        private static void WriteXmlFile(XNode doc, string fileName) {
            var fileInfo = new FileInfo(fileName);

            using (FileStream fileStream = fileInfo.OpenWrite()) {
                using (XmlWriter xmlWriter = XmlWriter.Create(fileStream, new XmlWriterSettings {Indent = true})) {
                    doc.WriteTo(xmlWriter);
                    xmlWriter.Flush();
                }
            }
        }

        private static string GetTestResultsDirectory() {
            var di = new DirectoryInfo(Directory.GetCurrentDirectory());

            while (di != null && di.Name != "test-results") {
                di = di.Parent;
            }
            return di == null ? Directory.GetCurrentDirectory() : di.FullName;
        }
    }
}