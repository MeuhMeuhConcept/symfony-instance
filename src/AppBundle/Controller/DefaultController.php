<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;

class DefaultController extends Controller
{
    /**
     * @Route("/", name="homepage")
     */
    public function indexAction(Request $request)
    {

        $dbVersion = $this->getDoctrine()->getRepository('AppBundle:Version')
            ->createQueryBuilder('v')
            ->orderBy('v.createdAt', 'desc')
            ->getQuery()
            ->getOneOrNullResult();

        // replace this example code with whatever you need
        return $this->render('default/index.html.twig', [
            'base_dir' => realpath($this->getParameter('kernel.project_dir')).DIRECTORY_SEPARATOR,
            'db_version' => $dbVersion,
        ]);
    }
}
